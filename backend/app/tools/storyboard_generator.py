"""
StudioScout AI — Storyboard & Moodboard Generator

Generates cinematic visual storyboards, moodboards, and camera framing references
for screenplay scenes using Google Gemini and Imagen 3.
"""
import asyncio
import base64
import json
import logging
from typing import Dict, Any, Optional

from google import genai as new_genai

from app.config import get_settings
from app.models.scene import Scene
from app.services.gemini_service import gemini_generate_json, _configure_client

logger = logging.getLogger(__name__)

STORYBOARD_DIRECTOR_SYSTEM = """You are a visionary Hollywood Director of Photography (DP) and VFX concept artist.
You design high-impact cinematic visual frames, camera setups, lighting schemes, and color palettes
for film scenes based on screenplay descriptions.
You MUST return valid JSON only."""

STORYBOARD_PROMPT_TEMPLATE = """Generate a director's visual concept board and Imagen 3 prompt for this scene:

SCENE: {heading}
LOCATION: {location} ({location_type})
TIME OF DAY: {time_of_day}
SETTING: {setting}
DESCRIPTION: {description}
PROPS: {props}
SPECIAL CONSTRAINTS: {special_constraints}

Return JSON with this exact schema:
{{
  "title": "Cinematic scene title",
  "aspect_ratio": "2.39:1 (Anamorphic Panavision)",
  "camera_angle": "Wide Establishing Low-Angle / Medium Close-Up / Dutch Angle",
  "lens_focal_length": "35mm / 50mm / 85mm Anamorphic",
  "lighting_style": "Dramatic Chiaroscuro / High-Key Clinical / Sodium Noir Glow",
  "color_palette": ["#Hex1", "#Hex2", "#Hex3", "#Hex4"],
  "visual_prompt": "Ultra-detailed 8K Imagen 3 cinematography prompt with camera gear, lighting direction, atmospheric haze, and cinematic textures",
  "director_notes": "Key emotional beat, lighting cue, and blocking instructions for the DP and camera crew"
}}
"""


async def generate_storyboard_concept(scene: Scene, project_city: str = "Mumbai") -> Dict[str, Any]:
    """
    Generate a rich cinematic visual concept board for a scene using Gemini.
    """
    prompt = STORYBOARD_PROMPT_TEMPLATE.format(
        heading=scene.heading,
        location=scene.location,
        location_type=scene.location_type,
        time_of_day=scene.time_of_day,
        setting=scene.setting,
        description=scene.description or "Cinematic scene action",
        props=", ".join(scene.props) if scene.props else "Standard scene dressing",
        special_constraints=", ".join(scene.special_constraints) if scene.special_constraints else "None",
    )

    try:
        concept = await gemini_generate_json(
            prompt=prompt,
            system_instruction=STORYBOARD_DIRECTOR_SYSTEM,
            temperature=0.3,
        )
        if not isinstance(concept, dict):
            concept = {
                "title": scene.heading,
                "aspect_ratio": "2.39:1",
                "camera_angle": "Wide Establishing",
                "lens_focal_length": "35mm Anamorphic",
                "lighting_style": "Cinematic Low-Key",
                "color_palette": ["#0f172a", "#1e293b", "#38bdf8", "#f59e0b"],
                "visual_prompt": f"Cinematic 35mm film still of {scene.heading} in {project_city}, atmospheric lighting, 8k resolution",
                "director_notes": f"Establish spatial geography of {scene.location} with wide lens.",
            }
    except Exception as e:
        logger.error(f"[Storyboard] Concept generation error: {e}")
        concept = {
            "title": scene.heading,
            "aspect_ratio": "2.39:1",
            "camera_angle": "Wide Establishing",
            "lens_focal_length": "35mm Anamorphic",
            "lighting_style": "Cinematic Lighting",
            "color_palette": ["#0f172a", "#1e293b", "#38bdf8", "#f59e0b"],
            "visual_prompt": f"Cinematic film still of {scene.heading} in {project_city}, atmospheric lighting, photorealistic, 8k resolution",
            "director_notes": f"Establish {scene.location} atmospheric lighting.",
        }

    concept["scene_id"] = scene.id
    concept["scene_number"] = scene.scene_number
    concept["location"] = scene.location

    # Try generating image with Imagen 3 if available
    image_url = await _generate_imagen_image(concept.get("visual_prompt", ""))
    if image_url:
        concept["image_url"] = image_url

    return concept


async def _generate_imagen_image(prompt: str) -> Optional[str]:
    """
    Attempt to generate an image using Google GenAI Imagen 3 API.
    Returns base64 data URI if successful, or None if quota/model is unavailable.
    """
    settings = get_settings()
    if not settings.gemini_configured:
        return None

    def _sync_imagen_call():
        try:
            client = _configure_client()
            # Attempt with imagen-3.0-generate-002
            result = client.models.generate_images(
                model="imagen-3.0-generate-002",
                prompt=prompt,
                config=dict(
                    number_of_images=1,
                    aspect_ratio="16:9",
                    output_mime_type="image/jpeg",
                ),
            )
            if result and hasattr(result, "generated_images") and result.generated_images:
                img_bytes = result.generated_images[0].image.image_bytes
                b64 = base64.b64encode(img_bytes).decode("utf-8")
                return f"data:image/jpeg;base64,{b64}"
        except Exception as e:
            logger.info(f"[Storyboard] Imagen 3 direct generation skipped (fallback to visual card): {e}")
            return None

    try:
        return await asyncio.to_thread(_sync_imagen_call)
    except Exception:
        return None
