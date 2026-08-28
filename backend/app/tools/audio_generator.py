"""
StudioScout AI — Lyria 3 Soundtrack & Audio Atmosphere Generator

Generates cinematic music cues, sound design atmospheres, BPM, instrumentation,
and Lyria 3 audio prompts for screenplay scenes.
"""
import logging
from typing import Dict, Any

from app.models.scene import Scene
from app.services.gemini_service import gemini_generate_json

logger = logging.getLogger(__name__)

AUDIO_COMPOSER_SYSTEM = """You are an award-winning Hollywood Film Composer and Sound Designer (e.g., in the style of Hans Zimmer, Trent Reznor, or Ludwig Göransson).
You compose scene-specific musical cues, sound design layers, and Lyria 3 generative music prompts based on screenplay scenes.
You MUST return valid JSON only."""

AUDIO_PROMPT_TEMPLATE = """Generate a film score and audio atmosphere blueprint for this scene:

SCENE: {heading}
LOCATION: {location} ({location_type})
TIME OF DAY: {time_of_day}
SETTING: {setting}
DESCRIPTION: {description}
PROPS: {props}
SPECIAL CONSTRAINTS: {special_constraints}

Return JSON with this exact schema:
{{
  "track_title": "Atmospheric track title",
  "genre": "Neo-Noir Ambient / Industrial Pulse / High-Octane Action Percussion",
  "bpm": 72,
  "key_signature": "D Minor / C# Phrygian / A Minor",
  "mood_descriptors": ["Tense", "Claustrophobic", "Subterranean", "Pulsing"],
  "instrumentation": ["Analog Moog Bass", "Processed Distorted Cello", "Granular Reverb Pads", "Sub-bass 808 Drone"],
  "foley_layers": ["Rain hitting single-pane high-rise glass", "Distant urban sirens with metallic reverb", "Muffled fluorescent buzz"],
  "lyria_prompt": "Ultra-detailed 30-second Lyria 3 generative music prompt with exact acoustic textures, tempo, frequency dynamics, and emotional intensity",
  "composer_notes": "Instruction for the sound mixer and music editor regarding dialogue frequency clearance and dynamic tension"
}}
"""


async def generate_scene_audio_cue(scene: Scene, project_city: str = "Mumbai") -> Dict[str, Any]:
    """
    Generate a rich cinematic audio blueprint and Lyria 3 prompt for a scene using Gemini.
    """
    prompt = AUDIO_PROMPT_TEMPLATE.format(
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
        cue = await gemini_generate_json(
            prompt=prompt,
            system_instruction=AUDIO_COMPOSER_SYSTEM,
            temperature=0.3,
        )
        if not isinstance(cue, dict):
            cue = {
                "track_title": f"Theme for {scene.heading}",
                "genre": "Cinematic Neo-Noir",
                "bpm": 75,
                "key_signature": "D Minor",
                "mood_descriptors": ["Tense", "Mysterious", "Atmospheric"],
                "instrumentation": ["Analog Synth", "Bowed Strings", "Sub Bass"],
                "foley_layers": ["Environmental ambient wash", "Location room tone"],
                "lyria_prompt": f"Cinematic atmospheric film score for {scene.heading} in {project_city}, dark moody synthesizer pads, slow tension build, 75 bpm",
                "composer_notes": "Keep low frequencies clear under main dialogue.",
            }
    except Exception as e:
        logger.error(f"[AudioGenerator] Error generating audio cue: {e}")
        cue = {
            "track_title": f"Score: {scene.heading}",
            "genre": "Cinematic Score",
            "bpm": 80,
            "key_signature": "C Minor",
            "mood_descriptors": ["Atmospheric", "Dramatic"],
            "instrumentation": ["Strings", "Synth Pads", "Percussion"],
            "foley_layers": ["City atmospheric tone"],
            "lyria_prompt": f"Moody cinematic score for {scene.heading}, 80 bpm, tension strings and analog bass",
            "composer_notes": "Dynamic tension rising toward end of scene.",
        }

    cue["scene_id"] = scene.id
    cue["scene_number"] = scene.scene_number
    cue["location"] = scene.location
    return cue
