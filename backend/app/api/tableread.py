"""
StudioScout AI — Multi-Speaker Script Table-Read & Dialogue Sentiment API Routes
"""
import logging
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends

from app.models.project import Project
from app.rate_limiter import rate_limit_expensive
from app.store import store
from app.tools.dialogue_director import generate_table_read_rehearsal

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/projects/{project_id}/scenes/{scene_id}/table-read", dependencies=[Depends(rate_limit_expensive)])
async def create_scene_table_read(project_id: str, scene_id: str):
    """Generate or retrieve a Gemini 3.1 Flash TTS multi-speaker table-read for a scene."""
    project = store.get_project(project_id)
    if not project:
        raise HTTPException(404, f"Project {project_id} not found")

    scenes = store.get_scenes(project_id)
    scene = next((s for s in scenes if s.id == scene_id), None)
    if not scene:
        raise HTTPException(404, f"Scene {scene_id} not found in project {project_id}")

    existing = store.get_table_read(scene_id)
    if existing:
        return existing

    # Generate new table read script & voice profiles
    table_read = await generate_table_read_rehearsal(scene, project.screenplay_text or "")
    store.save_table_read(scene_id, project_id, table_read)
    return table_read


@router.get("/projects/{project_id}/table-reads")
async def get_project_table_reads(project_id: str):
    """Get all generated table-read rehearsals and dialogue analyses for a project."""
    project = store.get_project(project_id)
    if not project:
        raise HTTPException(404, f"Project {project_id} not found")
    return store.get_project_table_reads(project_id)
