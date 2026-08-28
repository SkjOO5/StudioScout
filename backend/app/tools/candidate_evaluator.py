"""
StudioScout AI — Candidate Evaluator

Uses Gemini to evaluate Parallel Search results against scene requirements
and produces scored location candidates with transparent reasoning.

Scoring rubric:
  Visual Match:          0-25 pts  (aesthetic fit for the scene)
  Location Requirements: 0-20 pts  (technical requirements met)
  Accessibility:         0-15 pts  (crew, vehicle, transport access)
  Time/Lighting:         0-15 pts  (time-of-day suitability)
  Production Practicality: 0-15 pts (logistics, crew facilities, schedule)
  Risk Score:            0-10 pts  (higher = less risky, i.e. better)
  ─────────────────────────────────
  Total:                   100 pts
"""
import logging
from typing import Optional

from app.models.candidate import LocationCandidate, ScoreBreakdown, Evidence, Risk
from app.models.scene import Scene
from app.models.search import SearchResponse
from app.services.gemini_service import gemini_generate_json

logger = logging.getLogger(__name__)

EVALUATOR_SYSTEM = """You are an experienced film production coordinator and location manager.
You evaluate potential filming locations based on web research results and scene requirements.
You produce transparent, evidence-based assessments. 
You NEVER invent information — if a source doesn't support a claim, you flag it as unverified.
You MUST respond with valid JSON only."""

EVALUATION_PROMPT = """Evaluate potential filming locations for the following scene based on web research results.

SCENE REQUIREMENTS:
Scene: {scene_heading}
Location Type: {location_type}
Time of Day: {time_of_day}
Setting: {setting}
Characters: {characters}
Vehicles Needed: {vehicles}
Special Constraints: {special_constraints}
Requirements:
{requirements_text}

WEB RESEARCH RESULTS (from Parallel Search):
{search_results_text}

PRODUCTION CITY: {production_city}

Based ONLY on the web research results above, identify 2-4 specific location candidates.
For each candidate:

1. Calculate a score breakdown (total must equal sum of all dimensions):
   - visual_match: 0-25 (how well it visually matches the scene type)
   - location_requirements: 0-20 (how many technical requirements are met)
   - accessibility: 0-15 (crew, vehicle access, transport)
   - time_lighting: 0-15 (suitability for required time of day)
   - production_practicality: 0-15 (logistics, permits, facilities)
   - risk_score: 0-10 (10 = low risk, 0 = very high risk)

2. List strengths (what the source confirms)
3. List weaknesses (what's missing or uncertain)
4. List risks with severity (low/medium/high/critical)
5. List evidence (direct quotes/excerpts from sources, with source URLs)

CRITICAL RULES:
- Only reference information that appears in the search results
- If filming permit status is unknown, mark as risk
- If access details aren't confirmed, mark as weakness
- Use "Verify directly with location owner" for unconfirmed details
- Do not fabricate addresses or availability

Return JSON:
{{
  "candidates": [
    {{
      "name": "Location name",
      "description": "1-2 sentence description based on sources",
      "location_type": "industrial/residential/etc",
      "city": "{production_city}",
      "score_breakdown": {{
        "visual_match": 22,
        "location_requirements": 17,
        "accessibility": 12,
        "time_lighting": 14,
        "production_practicality": 11,
        "risk_score": 8
      }},
      "strengths": ["Large industrial space confirmed", "Vehicle access mentioned"],
      "weaknesses": ["Night access not confirmed", "Permit process unknown"],
      "risks": [
        {{
          "category": "permit",
          "description": "Filming permit status unconfirmed",
          "severity": "medium",
          "mitigation": "Contact location owner directly to confirm filming access"
        }}
      ],
      "evidence": [
        {{
          "requirement": "Large interior space",
          "excerpt": "...spans 50,000 sq ft of open industrial space...",
          "source_url": "https://example.com/venue",
          "source_title": "Venue Website",
          "confidence": "high"
        }}
      ],
      "sources": ["https://example.com/venue", "https://other.com/review"],
      "recommended_action": "Schedule a location scout visit to verify night access and permit requirements"
    }}
  ]
}}
"""


async def evaluate_candidates(
    scene: Scene,
    search_response: SearchResponse,
    production_city: str,
) -> list[LocationCandidate]:
    """
    Use Gemini to evaluate search results and produce scored location candidates.

    Args:
        scene: The scene requiring a location
        search_response: Results from Parallel Search
        production_city: City for production

    Returns:
        List of LocationCandidate objects sorted by score
    """
    logger.info(f"[CandidateEvaluator] Evaluating | scene={scene.scene_number} | results={len(search_response.results)}")

    if not search_response.results:
        logger.warning(f"[CandidateEvaluator] No search results to evaluate for scene {scene.scene_number}")
        return []

    # Format requirements
    requirements_text = "\n".join([
        f"  [{r.priority.upper()}] {r.category}: {r.description}"
        for r in scene.requirements
    ]) or "  - General location matching scene type"

    # Format search results
    results_text_parts = []
    for i, result in enumerate(search_response.results, 1):
        parts = [f"SOURCE {i}: {result.title}"]
        if result.url:
            parts.append(f"URL: {result.url}")
        if result.domain:
            parts.append(f"Domain: {result.domain}")
        if result.excerpt:
            parts.append(f"Excerpt: {result.excerpt}")
        results_text_parts.append("\n".join(parts))

    search_results_text = "\n\n".join(results_text_parts)

    prompt = EVALUATION_PROMPT.format(
        scene_heading=scene.heading,
        location_type=scene.location_type,
        time_of_day=scene.time_of_day,
        setting=scene.setting,
        characters=scene.characters,
        vehicles=scene.vehicles,
        special_constraints=", ".join(scene.special_constraints) or "None",
        requirements_text=requirements_text,
        search_results_text=search_results_text,
        production_city=production_city,
    )

    try:
        result = await gemini_generate_json(
            prompt=prompt,
            system_instruction=EVALUATOR_SYSTEM,
            temperature=0.15,
        )
    except Exception as e:
        logger.error(f"[CandidateEvaluator] Gemini evaluation failed: {e!r}")
        return []

    candidates_data = []
    if isinstance(result, dict):
        candidates_data = result.get("candidates", [])
    elif isinstance(result, list):
        candidates_data = result

    candidates = []
    for i, cand_data in enumerate(candidates_data):
        try:
            breakdown_data = cand_data.get("score_breakdown", {})
            breakdown = ScoreBreakdown(
                visual_match=min(25, float(breakdown_data.get("visual_match", 0))),
                location_requirements=min(20, float(breakdown_data.get("location_requirements", 0))),
                accessibility=min(15, float(breakdown_data.get("accessibility", 0))),
                time_lighting=min(15, float(breakdown_data.get("time_lighting", 0))),
                production_practicality=min(15, float(breakdown_data.get("production_practicality", 0))),
                risk_score=min(10, float(breakdown_data.get("risk_score", 0))),
            )

            evidence = []
            for ev_data in cand_data.get("evidence", []):
                evidence.append(Evidence(
                    requirement=ev_data.get("requirement", ""),
                    excerpt=ev_data.get("excerpt", ""),
                    source_url=ev_data.get("source_url", ""),
                    source_title=ev_data.get("source_title", ""),
                    confidence=ev_data.get("confidence", "medium"),
                ))

            risks = []
            for risk_data in cand_data.get("risks", []):
                risks.append(Risk(
                    category=risk_data.get("category", "general"),
                    description=risk_data.get("description", ""),
                    severity=risk_data.get("severity", "medium"),
                    mitigation=risk_data.get("mitigation", "Verify directly with location owner"),
                ))

            candidate = LocationCandidate(
                scene_id=scene.id,
                project_id=scene.project_id,
                name=cand_data.get("name", f"Location {i + 1}"),
                description=cand_data.get("description", ""),
                location_type=cand_data.get("location_type", scene.location_type),
                city=cand_data.get("city", production_city),
                match_score=round(breakdown.total, 1),
                score_breakdown=breakdown,
                strengths=cand_data.get("strengths", []),
                weaknesses=cand_data.get("weaknesses", []),
                risks=risks,
                evidence=evidence,
                sources=cand_data.get("sources", []),
                recommended_action=cand_data.get("recommended_action", "Schedule location scout visit"),
                rank=i + 1,
            )
            candidates.append(candidate)
        except Exception as e:
            logger.warning(f"[CandidateEvaluator] Skipped candidate {i}: {e!r}")
            continue

    # Sort by match score descending
    candidates.sort(key=lambda c: c.match_score, reverse=True)
    for i, c in enumerate(candidates):
        c.rank = i + 1

    logger.info(f"[CandidateEvaluator] Produced {len(candidates)} candidates for scene {scene.scene_number}")
    return candidates
