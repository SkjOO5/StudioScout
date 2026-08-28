"""
StudioScout AI — Storyboards & Visual Concept API Routes
"""
import logging
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends

from app.models.project import Project
from app.rate_limiter import rate_limit_expensive
from app.store import store
from app.tools.storyboard_generator import generate_storyboard_concept

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/projects/{project_id}/scenes/{scene_id}/storyboard", dependencies=[Depends(rate_limit_expensive)])
async def create_scene_storyboard(project_id: str, scene_id: str):
    """Generate or retrieve a visual storyboard moodboard for a scene."""
    project = store.get_project(project_id)
    if not project:
        raise HTTPException(404, f"Project {project_id} not found")

    scenes = store.get_scenes(project_id)
    scene = next((s for s in scenes if s.id == scene_id), None)
    if not scene:
        raise HTTPException(404, f"Scene {scene_id} not found in project {project_id}")

    existing = store.get_storyboard(scene_id)
    if existing:
        return existing

    # Generate new visual concept
    concept = await generate_storyboard_concept(scene, project.production_city)
    store.save_storyboard(scene_id, project_id, concept)
    return concept


@router.get("/projects/{project_id}/storyboards")
async def get_project_storyboards(project_id: str):
    """Get all generated storyboards for a project."""
    project = store.get_project(project_id)
    if not project:
        raise HTTPException(404, f"Project {project_id} not found")
    return store.get_project_storyboards(project_id)
