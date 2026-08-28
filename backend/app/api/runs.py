"""Agent runs API routes — scout, replan, status."""
import asyncio
import logging
from datetime import datetime

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends

from app.agent.root_agent import StudioScoutAgent
from app.config import get_settings
from app.models.agent_run import AgentRun, AgentStep, RunState
from app.models.plan import ReplanRequest
from app.models.project import ProjectStatus
from app.rate_limiter import rate_limit_scout
from app.store import store

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/projects/{project_id}/scout", dependencies=[Depends(rate_limit_scout)])
async def start_scout(project_id: str, background_tasks: BackgroundTasks):
    """Start the autonomous scouting workflow for a project."""
    project = store.get_project(project_id)
    if not project:
        raise HTTPException(404, f"Project {project_id} not found")

    if not (project.screenplay_text or project.scene_description):
        raise HTTPException(400, "Project has no screenplay content to analyze")

    # Create a new agent run
    run = AgentRun(
        project_id=project_id,
        state=RunState.QUEUED,
        run_type="scout",
    )
    store.save_run(run)

    # Link run to project
    project.current_run_id = run.id
    project.status = ProjectStatus.ANALYZING
    store.save_project(project)

    # Execute in background
    background_tasks.add_task(_execute_scout, project_id, run.id)

    return {"run_id": run.id, "status": run.state, "project_id": project_id}


@router.post("/projects/{project_id}/replan", dependencies=[Depends(rate_limit_scout)])
async def start_replan(
    project_id: str,
    request: ReplanRequest,
    background_tasks: BackgroundTasks,
):
    """Trigger replanning with a new constraint."""
    project = store.get_project(project_id)
    if not project:
        raise HTTPException(404, f"Project {project_id} not found")

    scenes = store.get_scenes(project_id)
    if not scenes:
        raise HTTPException(400, "No scenes found. Run the scout workflow first.")

    current_plan = store.get_plan(project_id)
    if not current_plan:
        raise HTTPException(400, "No production plan found. Run the scout workflow first.")

    # Build current candidates dict
    candidates_by_scene = {s.id: store.get_candidates(s.id) for s in scenes}
    searches_by_scene = {s.id: store.get_search(s.id) for s in scenes if store.get_search(s.id)}

    # Create replan run
    run = AgentRun(
        project_id=project_id,
        state=RunState.QUEUED,
        run_type="replan",
        replan_reason=request.constraint,
    )
    store.save_run(run)
    project.current_run_id = run.id
    store.save_project(project)

    background_tasks.add_task(
        _execute_replan, project_id, run.id,
        request, scenes, candidates_by_scene, current_plan, searches_by_scene
    )

    return {"run_id": run.id, "status": run.state, "replan_reason": request.constraint}


@router.get("/runs/{run_id}")
async def get_run(run_id: str):
    """Get an agent run and its activity timeline."""
    run = store.get_run(run_id)
    if not run:
        raise HTTPException(404, f"Run {run_id} not found")
    return run


@router.get("/projects/{project_id}/runs")
async def get_project_runs(project_id: str):
    """Get all runs for a project."""
    all_runs = [r for r in store.runs.values() if r.project_id == project_id]
    return sorted(all_runs, key=lambda r: r.started_at, reverse=True)


# ─── Background task implementations ──────────────────────────────────────────

async def _step_update_handler(run: AgentRun, step: AgentStep):
    """Persist run and step updates to store."""
    store.save_run(run)


async def _execute_scout(project_id: str, run_id: str):
    """Background: execute full scout workflow."""
    run = store.get_run(run_id)
    project = store.get_project(project_id)

    if not run or not project:
        logger.error(f"[Scout] Run or project not found | run_id={run_id} | project_id={project_id}")
        return

    settings = get_settings()
    agent = StudioScoutAgent(on_step_update=_step_update_handler)

    try:
        scenes, candidates_by_scene, searches_by_scene, plan = await asyncio.wait_for(
            agent.run_scout(project=project, run=run),
            timeout=settings.max_run_time_seconds,
        )

        # Persist results
        store.save_scenes(project_id, scenes)
        for scene in scenes:
            candidates = candidates_by_scene.get(scene.id, [])
            store.save_candidates(scene.id, candidates)
            search = searches_by_scene.get(scene.id)
            if search:
                store.save_search(scene.id, search)

        if plan:
            store.save_plan(project_id, plan)

        # Update project status
        project.scene_count = len(scenes)
        project.has_recommendations = run.candidates_found > 0
        project.has_plan = plan is not None
        project.status = ProjectStatus.COMPLETED
        store.save_project(project)

        store.save_run(run)
        logger.info(f"[Scout] Completed | project={project_id} | scenes={len(scenes)}")

    except Exception as e:
        logger.error(f"[Scout] Failed | project={project_id} | error={e!r}", exc_info=True)
        run.state = RunState.FAILED
        run.error = str(e)
        project.status = ProjectStatus.FAILED
        store.save_run(run)
        store.save_project(project)


async def _execute_replan(
    project_id: str,
    run_id: str,
    request: ReplanRequest,
    scenes,
    candidates_by_scene,
    current_plan,
    searches_by_scene,
):
    """Background: execute replan workflow."""
    run = store.get_run(run_id)
    project = store.get_project(project_id)

    if not run or not project:
        return

    settings = get_settings()
    agent = StudioScoutAgent(on_step_update=_step_update_handler)

    try:
        new_candidates, new_plan = await asyncio.wait_for(
            agent.run_replan(
                project=project,
                run=run,
                replan_request=request,
                current_scenes=scenes,
                current_candidates=candidates_by_scene,
                current_plan=current_plan,
                current_searches=searches_by_scene,
            ),
            timeout=settings.max_run_time_seconds,
        )

        # Persist updated data
        for scene in scenes:
            if scene.id in new_candidates:
                store.save_candidates(scene.id, new_candidates[scene.id])

        store.save_plan(project_id, new_plan)
        store.save_run(run)

        logger.info(f"[Replan] Completed | project={project_id}")

    except Exception as e:
        logger.error(f"[Replan] Failed | project={project_id} | error={e!r}", exc_info=True)
        run.state = RunState.FAILED
        run.error = str(e)
        store.save_run(run)
