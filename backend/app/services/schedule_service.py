"""
StudioScout AI — Shooting Schedule CSV Service

Generates Google Sheets & Microsoft Excel compatible CSV schedules from
canonical ProductionPlan, Scene, and Candidate data.
"""
import csv
import io
from datetime import date, timedelta
from typing import List, Optional

from app.models.project import Project
from app.models.plan import ProductionPlan
from app.models.scene import Scene
from app.models.candidate import LocationCandidate


def generate_schedule_csv(
    project: Project, 
    plan: ProductionPlan, 
    scenes: List[Scene],
    candidates: Optional[List[LocationCandidate]] = None
) -> str:
    """
    Generate RFC 4180 compliant CSV content with UTF-8 BOM encoding.
    """
    output = io.StringIO()
    # Write UTF-8 BOM for flawless native Excel / Google Sheets character handling
    output.write("\ufeff")
    
    writer = csv.writer(output, dialect="excel", quoting=csv.QUOTE_MINIMAL)

    # 1. Metadata Header Block
    writer.writerow(["STUDIOSCOUT AI — MASTER PRODUCTION SHOOTING SCHEDULE"])
    writer.writerow(["Project Title", project.name])
    writer.writerow(["Genre", project.genre.value.title()])
    writer.writerow(["Production City", project.production_city])
    writer.writerow(["Budget Tier", project.budget_tier.value.title()])
    writer.writerow(["Total Shooting Days", plan.total_days or len(plan.shooting_days)])
    writer.writerow(["Plan Version", f"v{plan.version}"])
    if plan.replan_reason:
        writer.writerow(["Re-plan Reason", plan.replan_reason])
    writer.writerow([])  # Blank spacer row

    # 2. Main Schedule Table Headers
    writer.writerow([
        "Day #",
        "Date",
        "Call Time",
        "Wrap Time",
        "Start Time",
        "End Time",
        "Scene #",
        "Scene Heading",
        "Location / Venue",
        "Setting",
        "Time of Day",
        "Activity Description",
        "Cast Count",
        "Vehicles",
        "Est. Crew",
        "Complexity",
        "Production Notes",
        "Verified Risks"
    ])

    scene_map = {s.scene_number: s for s in scenes}
    
    base_date = project.created_at.date() if project.created_at else date.today()
    if base_date < date.today():
        base_date = date.today() + timedelta(days=7)

    # 3. Data Rows
    for day in plan.shooting_days:
        day_offset = day.day_number - 1
        shoot_date = (base_date + timedelta(days=day_offset)).strftime("%Y-%m-%d")

        if not day.blocks:
            # Output single day summary row if no granular blocks
            writer.writerow([
                f"Day {day.day_number}",
                shoot_date,
                day.call_time,
                day.wrap_time,
                day.call_time,
                day.wrap_time,
                "-",
                "-",
                day.location,
                "-",
                "-",
                "Full Day Production",
                "-",
                "-",
                day.crew_size or "-",
                day.complexity.upper(),
                "; ".join(day.notes) if day.notes else "-",
                "-"
            ])
            continue

        for block in day.blocks:
            scene = scene_map.get(block.scene_number) if block.scene_number else None
            
            scene_heading = scene.heading if scene else (f"Scene {block.scene_number}" if block.scene_number else "-")
            setting = scene.setting.upper() if scene else "-"
            time_of_day = scene.time_of_day.upper() if scene else "-"
            cast_count = str(scene.characters) if (scene and scene.characters) else "-"
            vehicles = "Yes" if (scene and scene.vehicles) else ("No" if scene else "-")
            
            notes_parts = []
            if block.notes:
                notes_parts.append(block.notes)
            if day.notes:
                notes_parts.extend(day.notes)
            notes_str = "; ".join(notes_parts) if notes_parts else "-"

            risks_str = "; ".join(scene.special_constraints) if (scene and scene.special_constraints) else "-"

            writer.writerow([
                f"Day {day.day_number}",
                shoot_date,
                day.call_time,
                day.wrap_time,
                block.start_time,
                block.end_time,
                str(block.scene_number) if block.scene_number else "-",
                scene_heading,
                block.location or day.location,
                setting,
                time_of_day,
                block.activity,
                cast_count,
                vehicles,
                str(day.crew_size) if day.crew_size else "-",
                day.complexity.upper(),
                notes_str,
                risks_str
            ])

    return output.getvalue()
