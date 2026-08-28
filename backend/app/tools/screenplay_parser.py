"""
StudioScout AI — Screenplay Parser

Extracts structured scene data from PDF screenplays or plain text descriptions.
Uses pdfplumber for PDF text extraction and Gemini for intelligent scene parsing.
"""
import asyncio
import logging
import re
from pathlib import Path
from typing import Optional

import pdfplumber

from app.models.scene import Scene, SceneRequirement
from app.services.gemini_service import gemini_generate_json

logger = logging.getLogger(__name__)

SCREENPLAY_ANALYSIS_SYSTEM = """You are an expert film production coordinator and script supervisor with 20+ years of experience.
Your task is to analyze screenplay content and extract structured production information.
You MUST respond with valid JSON only — no explanation, no markdown outside the JSON block.
Be thorough but practical. Focus on what a location scout and production coordinator needs to know."""

SCENE_EXTRACTION_PROMPT = """Analyze the following screenplay content and extract ALL scenes with their production requirements.

For each scene, identify:
- Scene number (sequential if not explicitly numbered)
- Scene heading (INT/EXT, location, time of day)
- Location name (just the place, e.g., "Warehouse", "Rooftop")
- Location type (industrial, residential, commercial, exterior-urban, exterior-rural, institutional, etc.)
- Time of day (day, night, dusk, dawn, golden_hour)
- Setting (interior, exterior, both)
- Brief scene description (1-2 sentences what happens)
- Number of characters present
- Whether vehicles are needed (true/false)
- Props needed (list of significant props)
- Special constraints (any specific requirements like "must be raining", "needs real fire", etc.)
- Production requirements (structured list with category and description)

Production requirement categories:
- space_size: small/medium/large/very_large
- lighting_control: natural_only/controlled/both
- vehicle_access: not_needed/standard/large_vehicles
- noise_sensitivity: low/medium/high (high means quiet location needed)
- special_permits: list any likely permit needs
- crew_size: small (<10)/medium (10-30)/large (30-100)/very_large (100+)
- shooting_time: estimated hours needed

IMPORTANT: Even if the screenplay is short or a scene description, extract as many scenes as possible.
If it's a single scene description, treat it as Scene 1.

Return JSON in this exact format:
{
  "project_title": "inferred or unknown",
  "genre_hints": ["thriller", "action"],
  "scenes": [
    {
      "scene_number": 1,
      "heading": "INT. ABANDONED WAREHOUSE - NIGHT",
      "location": "Abandoned Warehouse",
      "location_type": "industrial",
      "time_of_day": "night",
      "setting": "interior",
      "description": "Detective confronts suspect among rusted machinery",
      "characters": 3,
      "vehicles": false,
      "props": ["flashlights", "rusted machinery", "steel cables"],
      "special_constraints": ["practical darkness needed", "echo acoustics preferred"],
      "requirements": [
        {"category": "space_size", "description": "Large interior, minimum 5000 sq ft", "priority": "required"},
        {"category": "lighting_control", "description": "Full lighting control, no natural light leak", "priority": "required"},
        {"category": "noise_sensitivity", "description": "Moderate - some noise acceptable", "priority": "preferred"},
        {"category": "vehicle_access", "description": "Crew vehicles must reach location", "priority": "required"},
        {"category": "special_permits", "description": "May need industrial property filming permit", "priority": "required"}
      ]
    }
  ]
}

SCREENPLAY CONTENT:
{screenplay_text}
"""


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from a PDF file using pdfplumber."""
    try:
        full_text = []
        with pdfplumber.open(pdf_path) as pdf:
            logger.info(f"[ScreenplayParser] PDF opened | pages={len(pdf.pages)}")
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    full_text.append(text)
        combined = "\n".join(full_text)
        logger.info(f"[ScreenplayParser] PDF extracted | chars={len(combined)}")
        return combined
    except Exception as e:
        logger.error(f"[ScreenplayParser] PDF extraction failed: {e!r}")
        raise ValueError(f"Could not extract text from PDF: {str(e)}")


def _basic_scene_detection(text: str) -> list[str]:
    """Quick check: count scene headings in text."""
    # Standard screenplay scene heading pattern
    pattern = r"^(INT\.|EXT\.|INT/EXT\.|EXT/INT\.)\s+.+\s*[-–]\s*.+"
    matches = re.findall(pattern, text, re.MULTILINE | re.IGNORECASE)
    return matches


async def parse_screenplay(
    text: str,
    project_id: str,
) -> list[Scene]:
    """
    Parse screenplay text into structured Scene objects using Gemini.

    Args:
        text: Raw screenplay or scene description text
        project_id: Parent project ID

    Returns:
        List of Scene objects with requirements
    """
    logger.info(f"[ScreenplayParser] Parsing screenplay | chars={len(text)} | project_id={project_id}")

    # Detect scene headings for quick count
    detected_headings = _basic_scene_detection(text)
    logger.info(f"[ScreenplayParser] Detected {len(detected_headings)} scene headings via regex")

    # Truncate very long screenplays to avoid token limits (keep first 80K chars)
    max_chars = 80_000
    truncated = False
    if len(text) > max_chars:
        text = text[:max_chars]
        truncated = True
        logger.warning(f"[ScreenplayParser] Screenplay truncated to {max_chars} chars")

    prompt = SCENE_EXTRACTION_PROMPT.replace("{screenplay_text}", text)

    try:
        result = await gemini_generate_json(
            prompt=prompt,
            system_instruction=SCREENPLAY_ANALYSIS_SYSTEM,
            temperature=0.1,
        )
    except Exception as e:
        logger.error(f"[ScreenplayParser] Gemini parsing failed: {e!r}")
        raise ValueError(f"Scene analysis failed: {str(e)}")

    # Normalize result
    if isinstance(result, list):
        scenes_data = result
    elif isinstance(result, dict):
        scenes_data = result.get("scenes", [])
    else:
        raise ValueError("Unexpected response format from Gemini")

    scenes = []
    for i, scene_data in enumerate(scenes_data):
        try:
            requirements = []
            for req_data in scene_data.get("requirements", []):
                requirements.append(SceneRequirement(
                    category=req_data.get("category", "general"),
                    description=req_data.get("description", ""),
                    priority=req_data.get("priority", "required"),
                ))

            scene = Scene(
                project_id=project_id,
                scene_number=scene_data.get("scene_number", i + 1),
                heading=scene_data.get("heading", f"SCENE {i + 1}"),
                location=scene_data.get("location", "Unknown Location"),
                location_type=scene_data.get("location_type", "general"),
                time_of_day=scene_data.get("time_of_day", "day"),
                setting=scene_data.get("setting", "interior"),
                description=scene_data.get("description", ""),
                characters=int(scene_data.get("characters", 0)),
                vehicles=bool(scene_data.get("vehicles", False)),
                props=scene_data.get("props", []),
                special_constraints=scene_data.get("special_constraints", []),
                requirements=requirements,
            )
            scenes.append(scene)
        except Exception as e:
            logger.warning(f"[ScreenplayParser] Skipped scene {i}: {e!r}")
            continue

    logger.info(f"[ScreenplayParser] Extracted {len(scenes)} scenes")
    return scenes
