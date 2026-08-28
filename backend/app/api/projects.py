"""Projects API routes."""
import logging
import os
import tempfile
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends

from app.config import get_settings
from app.models.project import Project, ProjectCreate, ProjectUpdate, ProjectStatus
from app.models.scene import Scene, SceneCreate, SceneUpdate
from app.store import store

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/projects", response_model=Project)
async def create_project(
    name: str = Form(...),
    genre: str = Form("thriller"),
    production_city: str = Form(...),
    budget_tier: str = Form("mid"),
    scene_description: Optional[str] = Form(None),
    screenplay: Optional[UploadFile] = File(None),
):
    """Create a new production project."""
    settings = get_settings()

    screenplay_text = None
    screenplay_filename = None

    # Handle PDF upload
    if screenplay and screenplay.filename:
        if not screenplay.filename.lower().endswith(".pdf"):
            raise HTTPException(400, "Only PDF files are supported for screenplay upload")

        content = await screenplay.read()
        if len(content) > settings.max_upload_bytes:
            raise HTTPException(413, f"File too large. Maximum size: {settings.max_upload_size_mb}MB")

        # Extract text from PDF
        try:
            import pdfplumber
            import io
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                pages = [page.extract_text() or "" for page in pdf.pages]
                screenplay_text = "\n".join(pages)
            screenplay_filename = screenplay.filename
            logger.info(f"[API] PDF extracted | filename={screenplay_filename} | chars={len(screenplay_text)}")
        except Exception as e:
            logger.error(f"[API] PDF extraction failed: {e!r}")
            raise HTTPException(422, f"Could not parse PDF: {str(e)}")

    elif scene_description:
        screenplay_text = scene_description

    if not screenplay_text and not scene_description:
        raise HTTPException(400, "Provide either a screenplay PDF or a scene description")

    try:
        project = Project(
            name=name,
            genre=genre,
            production_city=production_city,
            budget_tier=budget_tier,
            scene_description=scene_description,
            screenplay_filename=screenplay_filename,
            screenplay_text=screenplay_text,
        )
        store.save_project(project)
        logger.info(f"[API] Project created | id={project.id} | name='{name}'")
        return project
    except Exception as e:
        logger.error(f"[API] Project creation failed: {e!r}")
        raise HTTPException(400, str(e))


@router.get("/projects", response_model=list[Project])
async def list_projects():
    """List all projects."""
    return store.list_projects()


@router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    """Get a project by ID."""
    project = store.get_project(project_id)
    if not project:
        raise HTTPException(404, f"Project {project_id} not found")
    return project


@router.patch("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, updates: ProjectUpdate):
    """Update project metadata."""
    project = store.update_project(project_id, updates.model_dump(exclude_unset=True))
    if not project:
        raise HTTPException(404, f"Project {project_id} not found")
    return project


@router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    """Delete a project and all associated scenes, candidates, and plans."""
    success = store.delete_project(project_id)
    if not success:
        raise HTTPException(404, f"Project {project_id} not found")
    return {"message": f"Project {project_id} deleted successfully", "id": project_id}


@router.post("/projects/{project_id}/scenes", response_model=Scene)
async def add_scene(project_id: str, scene_in: SceneCreate):
    """Add a new scene manually to a project."""
    project = store.get_project(project_id)
    if not project:
        raise HTTPException(404, f"Project {project_id} not found")
    scene = Scene(
        project_id=project_id,
        **scene_in.model_dump()
    )
    return store.add_scene(project_id, scene)


@router.patch("/projects/{project_id}/scenes/{scene_id}", response_model=Scene)
async def update_scene(project_id: str, scene_id: str, updates: SceneUpdate):
    """Update a scene's properties."""
    scene = store.update_scene(project_id, scene_id, updates.model_dump(exclude_unset=True))
    if not scene:
        raise HTTPException(404, f"Scene {scene_id} not found")
    return scene


@router.delete("/projects/{project_id}/scenes/{scene_id}")
async def delete_scene(project_id: str, scene_id: str):
    """Delete a scene from a project."""
    success = store.delete_scene(project_id, scene_id)
    if not success:
        raise HTTPException(404, f"Scene {scene_id} not found in project {project_id}")
    return {"message": f"Scene {scene_id} deleted successfully", "id": scene_id}


@router.delete("/projects/{project_id}/scenes/{scene_id}/candidates/{candidate_id}")
async def delete_candidate(project_id: str, scene_id: str, candidate_id: str):
    """Remove / reject a location candidate from a scene."""
    success = store.delete_candidate(scene_id, candidate_id)
    if not success:
        raise HTTPException(404, f"Candidate {candidate_id} not found")
    return {"message": f"Candidate {candidate_id} removed", "id": candidate_id}


@router.get("/projects/{project_id}/scenes")
async def get_scenes(project_id: str):
    """Get scenes for a project."""
    project = store.get_project(project_id)
    if not project:
        raise HTTPException(404, f"Project {project_id} not found")
    return store.get_scenes(project_id)


@router.get("/projects/{project_id}/recommendations")
async def get_recommendations(project_id: str):
    """Get all location candidates for a project."""
    project = store.get_project(project_id)
    if not project:
        raise HTTPException(404, f"Project {project_id} not found")
    return store.get_all_candidates(project_id)


@router.get("/projects/{project_id}/plan")
async def get_plan(project_id: str):
    """Get production plan for a project."""
    project = store.get_project(project_id)
    if not project:
        raise HTTPException(404, f"Project {project_id} not found")
    plan = store.get_plan(project_id)
    if not plan:
        raise HTTPException(404, "Production plan not yet generated")
    return plan


@router.get("/projects/{project_id}/sources")
async def get_sources(project_id: str):
    """Get all research sources for a project."""
    project = store.get_project(project_id)
    if not project:
        raise HTTPException(404, f"Project {project_id} not found")
    searches = store.get_all_searches(project_id)
    scenes = store.get_scenes(project_id)
    scene_map = {s.id: s for s in scenes}

    sources = []
    for search_resp in searches:
        for result in search_resp.results:
            scene = scene_map.get(result.relevant_to or "")
            sources.append({
                "id": result.id,
                "title": result.title,
                "url": result.url,
                "domain": result.domain,
                "excerpt": result.excerpt,
                "query_used": result.query_used,
                "scene_number": scene.scene_number if scene else None,
                "scene_location": scene.location if scene else None,
            })
    return sources

