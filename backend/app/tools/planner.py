"""
StudioScout AI — Production Planner

Generates a practical shooting schedule from scenes and location candidates.
Handles replanning when constraints change.
"""
import logging
from typing import Optional

from app.models.scene import Scene
from app.models.candidate import LocationCandidate
from app.models.plan import ProductionPlan, ShootingDay, ShootingBlock, PlanConstraint
from app.services.gemini_service import gemini_generate_json

logger = logging.getLogger(__name__)

PLANNER_SYSTEM = """You are a senior film production coordinator with 25+ years of experience.
You create practical, detailed shooting schedules that account for location logistics,
lighting requirements, crew needs, and production efficiency.
You MUST respond with valid JSON only."""

PLANNING_PROMPT = """Create a detailed shooting schedule for the following film production.

PROJECT: {project_name}
CITY: {city}
BUDGET TIER: {budget_tier}

SCENES TO SCHEDULE:
{scenes_text}

CONSTRAINTS:
{constraints_text}

Create an optimized shooting schedule that:
1. Groups scenes by location to minimize company moves
2. Accounts for time-of-day requirements (night scenes need proper scheduling)
3. Allows adequate setup and breakdown time
4. Considers crew fatigue (max 14-hour days)
5. Flags any scheduling conflicts

Return JSON:
{{
  "summary": "3-sentence summary of the production plan",
  "shooting_days": [
    {{
      "day_number": 1,
      "date_label": "Day 1",
      "location": "Primary location name",
      "call_time": "07:00",
      "wrap_time": "20:00",
      "crew_size": 35,
      "complexity": "high",
      "blocks": [
        {{
          "start_time": "07:00",
          "end_time": "08:00",
          "activity": "Crew call and setup",
          "scene_number": null,
          "location": "Primary location",
          "notes": "Camera and lighting rig setup"
        }},
        {{
          "start_time": "09:30",
          "end_time": "12:30",
          "activity": "Shoot Scene 3 - Warehouse Confrontation",
          "scene_number": 3,
          "location": "Industrial Warehouse",
          "notes": "Night exterior lighting required even though interior"
        }}
      ],
      "notes": ["Confirm venue access by 06:30", "Permit copy must be on set"]
    }}
  ],
  "overall_risks": ["Weather dependency for exterior scenes", "Permit confirmation pending"],
  "dependencies": ["Location 1 must be secured before Day 2 can be confirmed"],
  "recommended_actions": [
    "Confirm permit for warehouse filming 2 weeks before shoot",
    "Scout all locations at same time of day as planned shooting"
  ]
}}
"""

REPLAN_PROMPT = """A constraint has changed for this film production. Re-evaluate and update the shooting schedule.

PROJECT: {project_name}
CITY: {city}

ORIGINAL PLAN SUMMARY: {original_summary}

NEW CONSTRAINT: {new_constraint}
CONSTRAINT TYPE: {constraint_type}
AFFECTS LOCATION: {affects_location}

SCENES AFFECTED: {affected_scenes}

ALL SCENES IN PROJECT:
{scenes_text}

AVAILABLE LOCATION CANDIDATES (after constraint):
{candidates_text}

Create an updated shooting schedule that works around the new constraint.
Explain what changed and why.

Return JSON in the same format as before, plus add:
{{
  "replan_summary": "What changed and why",
  "invalidated_candidates": ["List of location names no longer viable"],
  "new_recommendations": ["What was selected instead and why"],
  ...rest of shooting_days etc...
}}
"""


async def generate_plan(
    project_name: str,
    city: str,
    budget_tier: str,
    scenes: list[Scene],
    candidates_by_scene: dict[str, list[LocationCandidate]],
    constraints: list[PlanConstraint] | None = None,
) -> ProductionPlan:
    """Generate a production plan from scenes and recommended candidates."""
    logger.info(f"[Planner] Generating plan | project='{project_name}' | scenes={len(scenes)}")

    # Format scenes with their top candidates
    scenes_parts = []
    for scene in scenes:
        scene_candidates = candidates_by_scene.get(scene.id, [])
        top_candidate = scene_candidates[0] if scene_candidates else None

        part = f"""Scene {scene.scene_number}: {scene.heading}
  Location Type: {scene.location_type}
  Time: {scene.time_of_day}
  Characters: {scene.characters}
  Vehicles: {scene.vehicles}
  Duration Estimate: {_estimate_scene_duration(scene)} hours"""

        if top_candidate:
            part += f"""
  Recommended Location: {top_candidate.name} ({top_candidate.match_score:.0f}% match)
  Location City: {top_candidate.city}"""

        scenes_parts.append(part)

    scenes_text = "\n\n".join(scenes_parts)
    constraints_text = "\n".join([f"- {c.description}" for c in (constraints or [])]) or "None specified"

    prompt = PLANNING_PROMPT.format(
        project_name=project_name,
        city=city,
        budget_tier=budget_tier,
        scenes_text=scenes_text,
        constraints_text=constraints_text,
    )

    try:
        result = await gemini_generate_json(
            prompt=prompt,
            system_instruction=PLANNER_SYSTEM,
            temperature=0.2,
        )
    except Exception as e:
        logger.error(f"[Planner] Planning failed: {e!r}")
        # Return a minimal fallback plan
        return _create_fallback_plan(project_name, scenes)

    return _parse_plan_result(result, project_name, constraints or [])


async def replan(
    project_name: str,
    city: str,
    original_plan: ProductionPlan,
    new_constraint: PlanConstraint,
    scenes: list[Scene],
    candidates_by_scene: dict[str, list[LocationCandidate]],
) -> ProductionPlan:
    """Re-generate the plan with a new constraint."""
    logger.info(f"[Planner] Replanning | constraint='{new_constraint.description}'")

    affected_scenes_text = ", ".join([f"Scene {i}" for i in new_constraint.affects_scene_ids]) or "All scenes"

    candidates_parts = []
    for scene in scenes:
        candidates = candidates_by_scene.get(scene.id, [])
        for c in candidates[:3]:  # Top 3 per scene
            candidates_parts.append(f"  Scene {scene.scene_number}: {c.name} (score: {c.match_score:.0f})")

    candidates_text = "\n".join(candidates_parts) or "No candidates available"
    scenes_text = "\n".join([
        f"Scene {s.scene_number}: {s.heading} | {s.location_type} | {s.time_of_day}" for s in scenes
    ])

    prompt = REPLAN_PROMPT.format(
        project_name=project_name,
        city=city,
        original_summary=original_plan.summary or "Original plan",
        new_constraint=new_constraint.description,
        constraint_type=new_constraint.type,
        affects_location=new_constraint.affects_location or "Not specified",
        affected_scenes=affected_scenes_text,
        scenes_text=scenes_text,
        candidates_text=candidates_text,
    )

    try:
        result = await gemini_generate_json(
            prompt=prompt,
            system_instruction=PLANNER_SYSTEM,
            temperature=0.2,
        )
    except Exception as e:
        logger.error(f"[Planner] Replanning failed: {e!r}")
        return original_plan

    new_plan = _parse_plan_result(
        result,
        project_name,
        original_plan.constraints + [new_constraint],
    )
    new_plan.version = original_plan.version + 1
    new_plan.previous_version_id = original_plan.id
    new_plan.replan_reason = new_constraint.description

    # Include replan-specific info in summary
    if isinstance(result, dict) and result.get("replan_summary"):
        new_plan.summary = result["replan_summary"] + "\n\n" + new_plan.summary

    return new_plan


def _estimate_scene_duration(scene: Scene) -> float:
    """Estimate shooting hours for a scene based on complexity."""
    base = 2.0
    if scene.vehicles:
        base += 1.0
    if scene.characters > 5:
        base += 0.5
    if scene.time_of_day in ("night", "dusk", "dawn"):
        base += 1.0
    if scene.setting == "both":
        base += 0.5
    return base


def _parse_plan_result(
    result: dict | list,
    project_name: str,
    constraints: list[PlanConstraint],
) -> ProductionPlan:
    """Parse Gemini's planning result into a ProductionPlan."""
    if isinstance(result, list):
        data = {"shooting_days": result}
    else:
        data = result

    shooting_days = []
    for day_data in data.get("shooting_days", []):
        blocks = []
        for block_data in day_data.get("blocks", []):
            blocks.append(ShootingBlock(
                start_time=block_data.get("start_time", ""),
                end_time=block_data.get("end_time", ""),
                activity=block_data.get("activity", ""),
                scene_number=block_data.get("scene_number"),
                location=block_data.get("location"),
                notes=block_data.get("notes"),
            ))

        shooting_days.append(ShootingDay(
            day_number=day_data.get("day_number", len(shooting_days) + 1),
            date_label=day_data.get("date_label", f"Day {len(shooting_days) + 1}"),
            location=day_data.get("location", "TBD"),
            call_time=day_data.get("call_time", "08:00"),
            wrap_time=day_data.get("wrap_time", "20:00"),
            crew_size=day_data.get("crew_size", 20),
            complexity=day_data.get("complexity", "medium"),
            blocks=blocks,
            notes=day_data.get("notes", []),
        ))

    plan = ProductionPlan(
        project_id=project_name,  # Will be set properly by caller
        shooting_days=shooting_days,
        total_days=len(shooting_days),
        constraints=constraints,
        overall_risks=data.get("overall_risks", []),
        dependencies=data.get("dependencies", []),
        recommended_actions=data.get("recommended_actions", []),
        summary=data.get("summary", ""),
    )
    return plan


def _create_fallback_plan(project_name: str, scenes: list[Scene]) -> ProductionPlan:
    """Create a minimal fallback plan when Gemini fails."""
    return ProductionPlan(
        project_id=project_name,
        shooting_days=[],
        total_days=0,
        summary="Production plan generation encountered an error. Please retry.",
        overall_risks=["Plan generation failed — manual scheduling required"],
        recommended_actions=["Retry plan generation or contact support"],
    )
