"""
StudioScout AI — Document & Production Export Endpoints

Provides downloadable Production Bible (PDF), Daily Call Sheet (PDF),
Shooting Calendar (.ICS), and Shooting Schedule (CSV) exports from canonical
production data.
"""
import re
from fastapi import APIRouter, HTTPException, Query, Response
from fastapi.responses import Response

from app.store import store
from app.services.pdf_service import generate_production_bible_pdf, generate_call_sheet_pdf
from app.services.calendar_service import generate_ics_calendar
from app.services.schedule_service import generate_schedule_csv

router = APIRouter(prefix="/projects/{project_id}/export", tags=["Exports"])


def _sanitize_filename(name: str) -> str:
    """Sanitize string for safe Content-Disposition filename header."""
    clean = re.sub(r'[^a-zA-Z0-9_\- ]+', '', name)
    return clean.strip().replace(" ", "-") or "StudioScout-Project"


@router.get("/production-bible")
async def export_production_bible(project_id: str):
    """
    Download complete official Production Bible PDF for the project.
    """
    project = store.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    plan = store.get_plan(project_id)
    scenes = store.get_scenes(project_id)
    candidates = store.get_all_candidates(project_id)

    try:
        pdf_bytes = generate_production_bible_pdf(project, plan, scenes, candidates)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate Production Bible PDF: {str(e)}")

    safe_name = _sanitize_filename(project.name)
    filename = f"{safe_name}-Production-Bible.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache"
        }
    )


@router.get("/call-sheet")
async def export_daily_call_sheet(
    project_id: str,
    day: int = Query(1, ge=1, description="Shooting Day number")
):
    """
    Download official single-day Call Sheet PDF for specified shooting day.
    """
    project = store.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    plan = store.get_plan(project_id)
    if not plan or not plan.shooting_days:
        raise HTTPException(status_code=400, detail="No production plan or shooting days available to generate call sheet")

    target_day = next((d for d in plan.shooting_days if d.day_number == day), None)
    if not target_day:
        target_day = plan.shooting_days[0]

    scenes = store.get_scenes(project_id)
    candidates = store.get_all_candidates(project_id)

    try:
        pdf_bytes = generate_call_sheet_pdf(project, target_day, scenes, candidates)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate Call Sheet PDF: {str(e)}")

    safe_name = _sanitize_filename(project.name)
    filename = f"{safe_name}-Call-Sheet-Day-{target_day.day_number:02d}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache"
        }
    )


@router.get("/calendar")
async def export_shooting_calendar(project_id: str):
    """
    Download RFC 5545 iCalendar (.ics) file for Google Calendar, Apple Calendar, Outlook.
    """
    project = store.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    plan = store.get_plan(project_id)
    if not plan or not plan.shooting_days:
        raise HTTPException(status_code=400, detail="No production plan available to generate shooting calendar")

    scenes = store.get_scenes(project_id)

    try:
        ics_content = generate_ics_calendar(project, plan, scenes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate shooting calendar: {str(e)}")

    safe_name = _sanitize_filename(project.name)
    filename = f"{safe_name}-Shooting-Calendar.ics"

    return Response(
        content=ics_content,
        media_type="text/calendar; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache"
        }
    )


@router.get("/schedule")
async def export_shooting_schedule_csv(project_id: str):
    """
    Download RFC 4180 CSV shooting schedule for Google Sheets and Microsoft Excel.
    """
    project = store.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    plan = store.get_plan(project_id)
    if not plan or not plan.shooting_days:
        raise HTTPException(status_code=400, detail="No production plan available to generate schedule")

    scenes = store.get_scenes(project_id)
    candidates = store.get_all_candidates(project_id)

    try:
        csv_content = generate_schedule_csv(project, plan, scenes, candidates)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate shooting schedule CSV: {str(e)}")

    safe_name = _sanitize_filename(project.name)
    filename = f"{safe_name}-Shooting-Schedule.csv"

    return Response(
        content=csv_content,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Cache-Control": "no-cache"
        }
    )
