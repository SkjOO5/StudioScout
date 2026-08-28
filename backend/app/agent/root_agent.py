"""
StudioScout AI — Agent Orchestrator

The central orchestrating agent that drives the complete production-planning workflow.
Implements ADK-style deterministic multi-step orchestration using google-genai and Parallel Search.

Workflow:
  1. Receive project + screenplay/scene input
  2. Parse screenplay → extract scenes (Gemini)
  3. Concurrent Parallel Search for each scene requirements
  4. Source-grounded candidate evaluation (Gemini)
  5. Generate comprehensive production plan & call sheets (Gemini)
  6. Emit live step-by-step activity timeline
"""
import asyncio
import logging
from datetime import datetime
from typing import Optional, Callable

from app.models.agent_run import AgentRun, AgentStep, RunState, StepStatus
from app.models.candidate import LocationCandidate
from app.models.plan import ProductionPlan, PlanConstraint, ReplanRequest
from app.models.project import Project
from app.models.scene import Scene
from app.models.search import SearchResponse
from app.services.search_service import search_for_scene
from app.store import store
from app.tools.candidate_evaluator import evaluate_candidates
from app.tools.planner import generate_plan, replan
from app.tools.screenplay_parser import parse_screenplay

logger = logging.getLogger(__name__)


class StudioScoutAgent:
    """
    StudioScout orchestrator agent.

    Drives the full production-planning workflow autonomously.
    Emits step updates via the on_step_update callback.
    """

    def __init__(self, on_step_update: Optional[Callable] = None):
        self.on_step_update = on_step_update
        self._step_lock = asyncio.Lock()

    async def _update_step(
        self,
        run: AgentRun,
        step: AgentStep,
        status: StepStatus,
        detail: Optional[str] = None,
        error: Optional[str] = None,
    ) -> None:
        """Update a step status and notify the callback."""
        async with self._step_lock:
            step.status = status
            if detail:
                step.detail = detail
            if error:
                step.error = error
            if status == StepStatus.RUNNING and not step.started_at:
                step.started_at = datetime.utcnow()
            if status in (StepStatus.COMPLETED, StepStatus.FAILED, StepStatus.SKIPPED):
                step.completed_at = datetime.utcnow()
                if step.started_at:
                    delta = step.completed_at - step.started_at
                    step.duration_ms = int(delta.total_seconds() * 1000)

        if self.on_step_update:
            await self.on_step_update(run, step)

    def _add_step(self, run: AgentRun, name: str, tool_used: Optional[str] = None) -> AgentStep:
        """Add a new step to the run."""
        step = AgentStep(
            run_id=run.id,
            step_index=len(run.steps),
            name=name,
            status=StepStatus.PENDING,
            tool_used=tool_used,
        )
        run.steps.append(step)
        return step

    async def run_scout(
        self,
        project: Project,
        run: AgentRun,
    ) -> tuple[list[Scene], dict[str, list[LocationCandidate]], dict[str, SearchResponse], ProductionPlan]:
        """
        Execute the full scouting workflow for a project.

        Returns:
            (scenes, candidates_by_scene, searches_by_scene, production_plan)
        """
        run.state = RunState.ANALYZING
        logger.info(f"[Agent] Starting scout run | run_id={run.id} | project_id={project.id}")

        scenes: list[Scene] = []
        candidates_by_scene: dict[str, list[LocationCandidate]] = {}
        searches_by_scene: dict[str, SearchResponse] = {}
        plan: Optional[ProductionPlan] = None

        # ─── STEP 1: Parse screenplay ──────────────────────────────────────────
        step = self._add_step(run, "Analyzing screenplay", tool_used="gemini")
        await self._update_step(run, step, StepStatus.RUNNING, "Gemini is reading and parsing your screenplay...")

        try:
            input_text = project.screenplay_text or project.scene_description or ""
            if not input_text.strip():
                raise ValueError("No screenplay content provided")

            scenes = await parse_screenplay(input_text, project.id)
            run.scenes_processed = len(scenes)
            store.save_scenes(project.id, scenes)
            project.scene_count = len(scenes)
            store.save_project(project)

            await self._update_step(
                run, step, StepStatus.COMPLETED,
                f"{len(scenes)} scene{'s' if len(scenes) != 1 else ''} extracted from screenplay"
            )
        except Exception as e:
            await self._update_step(run, step, StepStatus.FAILED, error=str(e))
            run.state = RunState.FAILED
            run.error = f"Screenplay analysis failed: {str(e)}"
            return scenes, candidates_by_scene, searches_by_scene, plan

        # ─── STEP 2: Scene requirements ────────────────────────────────────────
        step = self._add_step(run, "Extracting production requirements", tool_used="gemini")
        await self._update_step(run, step, StepStatus.RUNNING, "Identifying location and production requirements for each scene...")

        total_requirements = sum(len(s.requirements) for s in scenes)
        await self._update_step(
            run, step, StepStatus.COMPLETED,
            f"{total_requirements} physical & logistical requirements identified across {len(scenes)} scenes"
        )

        # ─── STEP 3-N: Concurrent Research & Evaluation for Scenes ───────────────
        run.state = RunState.RESEARCHING
        semaphore = asyncio.Semaphore(2)  # Controlled concurrency for API stability

        async def process_single_scene(scene: Scene):
            async with semaphore:
                # 1. Search Step
                search_step = self._add_step(
                    run,
                    f"Searching for Scene {scene.scene_number}: {scene.location}",
                    tool_used="parallel_search"
                )
                await self._update_step(
                    run, search_step, StepStatus.RUNNING,
                    f"Calling Parallel Search for '{scene.location}' locations in {project.production_city}..."
                )

                try:
                    search_response = await search_for_scene(
                        scene=scene,
                        city=project.production_city,
                    )
                    searches_by_scene[scene.id] = search_response
                    store.save_search(scene.id, search_response, project.id)
                    run.searches_performed += 1

                    scene.research_status = "completed" if not search_response.error else "failed"
                    result_count = len(search_response.results)

                    if search_response.error:
                        await self._update_step(
                            run, search_step, StepStatus.COMPLETED,
                            f"Search returned {result_count} results (warning: {search_response.error})"
                        )
                    else:
                        await self._update_step(
                            run, search_step, StepStatus.COMPLETED,
                            f"Parallel Search returned {result_count} web results from {len(search_response.queries_run)} queries"
                        )
                except Exception as e:
                    scene.research_status = "failed"
                    await self._update_step(run, search_step, StepStatus.FAILED, error=str(e))
                    searches_by_scene[scene.id] = SearchResponse(
                        objective="", queries_run=[], results=[], total_found=0,
                        error=str(e)
                    )

                # 2. Evaluation Step
                if scene.research_status == "completed" and searches_by_scene.get(scene.id):
                    eval_step = self._add_step(
                        run,
                        f"Evaluating candidates for Scene {scene.scene_number}",
                        tool_used="gemini"
                    )
                    await self._update_step(
                        run, eval_step, StepStatus.RUNNING,
                        "Gemini is evaluating search results against 6-dimension scoring rubric..."
                    )

                    try:
                        candidates = await evaluate_candidates(
                            scene=scene,
                            search_response=searches_by_scene[scene.id],
                            production_city=project.production_city,
                        )
                        candidates_by_scene[scene.id] = candidates
                        store.save_candidates(scene.id, candidates)
                        run.candidates_found += len(candidates)
                        scene.recommendation_status = "available" if candidates else "failed"
                        store.save_scenes(project.id, scenes)

                        top_score = f" (Top: {candidates[0].match_score:.1f}/100)" if candidates else ""
                        await self._update_step(
                            run, eval_step, StepStatus.COMPLETED,
                            f"{len(candidates)} location candidates evaluated and scored{top_score}"
                        )
                    except Exception as e:
                        scene.recommendation_status = "failed"
                        await self._update_step(run, eval_step, StepStatus.FAILED, error=str(e))
                        candidates_by_scene[scene.id] = []

        # Run scene research & evaluations
        await asyncio.gather(*(process_single_scene(s) for s in scenes))
        
        project.has_recommendations = run.candidates_found > 0
        store.save_project(project)

        # ─── FINAL STEP: Generate production plan ─────────────────────────────
        run.state = RunState.PLANNING
        plan_step = self._add_step(run, "Generating production plan", tool_used="gemini")
        await self._update_step(
            run, plan_step, StepStatus.RUNNING,
            "Creating shooting schedule, call sheets, and daily logistics..."
        )

        try:
            plan = await generate_plan(
                project_name=project.name,
                city=project.production_city,
                budget_tier=project.budget_tier.value,
                scenes=scenes,
                candidates_by_scene=candidates_by_scene,
            )
            plan.project_id = project.id
            store.save_plan(project.id, plan)
            project.has_plan = True
            store.save_project(project)

            await self._update_step(
                run, plan_step, StepStatus.COMPLETED,
                f"Production plan created: {plan.total_days} shooting day(s) scheduled"
            )
        except Exception as e:
            await self._update_step(run, plan_step, StepStatus.FAILED, error=str(e))

        # ─── COMPLETE ─────────────────────────────────────────────────────────
        run.state = RunState.COMPLETED
        run.completed_at = datetime.utcnow()
        if run.started_at:
            delta = run.completed_at - run.started_at
            run.total_duration_ms = int(delta.total_seconds() * 1000)

        logger.info(
            f"[Agent] Scout run complete | run_id={run.id} | "
            f"scenes={len(scenes)} | candidates={run.candidates_found} | "
            f"duration_ms={run.total_duration_ms}"
        )

        return scenes, candidates_by_scene, searches_by_scene, plan

    async def run_replan(
        self,
        project: Project,
        run: AgentRun,
        replan_request: ReplanRequest,
        current_scenes: list[Scene],
        current_candidates: dict[str, list[LocationCandidate]],
        current_plan: ProductionPlan,
        current_searches: dict[str, SearchResponse],
    ) -> tuple[dict[str, list[LocationCandidate]], ProductionPlan]:
        """
        Execute replanning workflow when a constraint changes.

        Returns:
            (updated_candidates_by_scene, new_plan)
        """
        run.state = RunState.REPLANNING
        logger.info(f"[Agent] Starting replan | constraint='{replan_request.constraint}'")

        new_candidates = dict(current_candidates)
        new_plan = current_plan

        constraint = PlanConstraint(
            type=replan_request.constraint_type,
            description=replan_request.constraint,
            affects_scene_ids=replan_request.affects_scene_ids,
            affects_location=replan_request.affects_location,
        )

        # STEP: Identify affected scenes
        step = self._add_step(run, "Identifying affected scenes")
        await self._update_step(run, step, StepStatus.RUNNING, f"Analyzing impact of: {replan_request.constraint}")

        affected_scenes = []
        if replan_request.affects_scene_ids:
            affected_scenes = [s for s in current_scenes if s.id in replan_request.affects_scene_ids]
        elif replan_request.affects_location:
            # Find scenes whose top candidate matches the affected location
            for scene in current_scenes:
                candidates = current_candidates.get(scene.id, [])
                if candidates and replan_request.affects_location.lower() in candidates[0].name.lower():
                    affected_scenes.append(scene)

        await self._update_step(
            run, step, StepStatus.COMPLETED,
            f"{len(affected_scenes)} scene(s) affected by constraint"
        )

        # Re-search and re-evaluate affected scenes
        for scene in affected_scenes:
            search_step = self._add_step(
                run,
                f"Re-searching Scene {scene.scene_number}: alternative locations",
                tool_used="parallel_search"
            )
            await self._update_step(
                run, search_step, StepStatus.RUNNING,
                f"Parallel Search: finding alternative locations for Scene {scene.scene_number}..."
            )

            try:
                from app.tools.parallel_search import parallel_search
                from app.services.search_service import _generate_search_queries
                queries = _generate_search_queries(scene, project.production_city)
                queries = [f"alternative {q}" for q in queries[:3]]

                search_response = await parallel_search(
                    objective=f"Find alternative '{scene.location}' locations in {project.production_city} (original excluded due to: {replan_request.constraint})",
                    search_queries=queries,
                    max_results=10,
                )
                run.searches_performed += 1

                await self._update_step(
                    run, search_step, StepStatus.COMPLETED,
                    f"{len(search_response.results)} alternative results found"
                )

                # Re-evaluate
                eval_step = self._add_step(
                    run, f"Re-evaluating Scene {scene.scene_number} candidates",
                    tool_used="gemini"
                )
                await self._update_step(run, eval_step, StepStatus.RUNNING, "Evaluating alternative locations with Gemini...")

                new_candidates_for_scene = await evaluate_candidates(
                    scene=scene,
                    search_response=search_response,
                    production_city=project.production_city,
                )
                new_candidates[scene.id] = new_candidates_for_scene

                await self._update_step(
                    run, eval_step, StepStatus.COMPLETED,
                    f"{len(new_candidates_for_scene)} alternative candidates evaluated"
                )

            except Exception as e:
                await self._update_step(run, search_step, StepStatus.FAILED, error=str(e))

        # Re-generate plan
        plan_step = self._add_step(run, "Regenerating production plan", tool_used="gemini")
        await self._update_step(run, plan_step, StepStatus.RUNNING, "Updating shooting schedule with new constraint...")

        try:
            new_plan = await replan(
                project_name=project.name,
                city=project.production_city,
                original_plan=current_plan,
                new_constraint=constraint,
                scenes=current_scenes,
                candidates_by_scene=new_candidates,
            )
            new_plan.project_id = project.id

            await self._update_step(
                run, plan_step, StepStatus.COMPLETED,
                f"Plan updated: {new_plan.total_days} shooting day(s). Constraint incorporated."
            )
        except Exception as e:
            await self._update_step(run, plan_step, StepStatus.FAILED, error=str(e))

        run.state = RunState.COMPLETED
        run.completed_at = datetime.utcnow()

        return new_candidates, new_plan
