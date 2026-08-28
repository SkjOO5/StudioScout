"""
StudioScout AI — Lyria 3 Soundtrack & Audio Atmosphere API Routes
"""
import logging
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends

from app.models.project import Project
from app.rate_limiter import rate_limit_expensive
from app.store import store
from app.tools.audio_generator import generate_scene_audio_cue

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/projects/{project_id}/scenes/{scene_id}/audio", dependencies=[Depends(rate_limit_expensive)])
async def create_scene_audio_cue(project_id: str, scene_id: str):
    """Generate or retrieve a Lyria 3 audio soundtrack cue for a scene."""
    project = store.get_project(project_id)
    if not project:
        raise HTTPException(404, f"Project {project_id} not found")

    scenes = store.get_scenes(project_id)
    scene = next((s for s in scenes if s.id == scene_id), None)
    if not scene:
        raise HTTPException(404, f"Scene {scene_id} not found in project {project_id}")

    existing = store.get_audio_cue(scene_id)
    if existing:
        return existing

    # Generate new musical cue
    cue = await generate_scene_audio_cue(scene, project.production_city)
    store.save_audio_cue(scene_id, project_id, cue)
    return cue


@router.get("/projects/{project_id}/audio")
async def get_project_audio_cues(project_id: str):
    """Get all generated audio cues and soundtrack designs for a project."""
    project = store.get_project(project_id)
    if not project:
        raise HTTPException(404, f"Project {project_id} not found")
    return store.get_project_audio_cues(project_id)
