"""
StudioScout AI — Gemini Service

Wraps the google-genai SDK for all AI reasoning tasks.
Model is configurable via GEMINI_MODEL env var (default: gemini-2.0-flash).
"""
import json
import logging
import re
from typing import Optional

from google import genai as new_genai

from app.config import get_settings

logger = logging.getLogger(__name__)


def _configure_client():
    """Configure and return the appropriate Gemini client."""
    settings = get_settings()

    if settings.google_genai_use_vertexai and settings.google_cloud_project:
        # Vertex AI path
        client = new_genai.Client(
            vertexai=True,
            project=settings.google_cloud_project,
            location=settings.google_cloud_location,
        )
        logger.info(f"[Gemini] Using Vertex AI | project={settings.google_cloud_project} | location={settings.google_cloud_location}")
    else:
        # AI Studio path
        client = new_genai.Client(api_key=settings.google_api_key)
        logger.info(f"[Gemini] Using AI Studio | model={settings.gemini_model}")

    return client


def _extract_json(text: str) -> dict | list:
    """Extract JSON from Gemini response, handling markdown code fences."""
    # Remove markdown code fences
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        # Remove first and last fence lines
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines)
    return json.loads(text)


async def gemini_generate(
    prompt: str,
    system_instruction: Optional[str] = None,
    temperature: float = 0.2,
    expect_json: bool = False,
) -> str:
    """
    Send a prompt to Gemini and return the text response.

    Args:
        prompt: The user prompt
        system_instruction: Optional system prompt
        temperature: Sampling temperature (lower = more deterministic)
        expect_json: If True, request JSON response format
    """
    settings = get_settings()

    if not settings.gemini_configured:
        raise ValueError(
            "Gemini is not configured. Set GOOGLE_API_KEY or "
            "GOOGLE_CLOUD_PROJECT + GOOGLE_GENAI_USE_VERTEXAI=true in your .env file."
        )

    import asyncio

    def _sync_generate():
        client = _configure_client()
        model_name = settings.gemini_model

        contents = []
        if system_instruction:
            full_prompt = f"{system_instruction}\n\n{prompt}"
        else:
            full_prompt = prompt

        config_kwargs = {
            "temperature": temperature,
        }

        if expect_json:
            config_kwargs["response_mime_type"] = "application/json"

        candidate_models = [settings.gemini_model, "gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]
        # Deduplicate while preserving order
        unique_models = []
        for m in candidate_models:
            if m and m not in unique_models:
                unique_models.append(m)

        last_error = None
        for m in unique_models:
            try:
                response = client.models.generate_content(
                    model=m,
                    contents=full_prompt,
                    config=new_genai.types.GenerateContentConfig(**config_kwargs),
                )
                return response.text
            except Exception as e:
                last_error = e
                logger.warning(f"[Gemini] Model '{m}' attempt failed: {e}. Trying fallback if available...")
        
        logger.error(f"[Gemini] All model attempts failed: {last_error!r}")
        raise last_error

    try:
        result = await asyncio.to_thread(_sync_generate)
        return result
    except Exception as e:
        logger.error(f"[Gemini] gemini_generate error: {e!r}")
        raise


async def gemini_generate_json(
    prompt: str,
    system_instruction: Optional[str] = None,
    temperature: float = 0.1,
) -> dict | list:
    """Generate and parse a JSON response from Gemini."""
    text = await gemini_generate(
        prompt=prompt,
        system_instruction=system_instruction,
        temperature=temperature,
        expect_json=True,
    )
    try:
        return _extract_json(text)
    except json.JSONDecodeError as e:
        logger.error(f"[Gemini] Failed to parse JSON response: {e}\nRaw text: {text[:500]}")
        # Attempt regex extraction of JSON object/array
        match = re.search(r"(\{.*\}|\[.*\])", text, re.DOTALL)
        if match:
            return json.loads(match.group(1))
        raise ValueError(f"Gemini returned non-JSON response: {text[:200]}") from e
