"""
Unit and integration tests for StudioScout AI Document & Schedule Exports.
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.store import store
from app.demo_seed import seed_demo_project, DEMO_PROJECT_ID
from app.services.pdf_service import generate_production_bible_pdf, generate_call_sheet_pdf
from app.services.calendar_service import generate_ics_calendar
from app.services.schedule_service import generate_schedule_csv

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_demo_data():
    """Ensure demo project exists before export tests run."""
    seed_demo_project()


def test_pdf_production_bible_generation():
    project = store.get_project(DEMO_PROJECT_ID)
    assert project is not None
    plan = store.get_plan(DEMO_PROJECT_ID)
    scenes = store.get_scenes(DEMO_PROJECT_ID)
    candidates = store.get_all_candidates(DEMO_PROJECT_ID)

    pdf_bytes = generate_production_bible_pdf(project, plan, scenes, candidates)
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 1000
    assert pdf_bytes.startswith(b"%PDF")


def test_pdf_call_sheet_generation():
    project = store.get_project(DEMO_PROJECT_ID)
    assert project is not None
    plan = store.get_plan(DEMO_PROJECT_ID)
    assert plan is not None
    assert len(plan.shooting_days) > 0
    scenes = store.get_scenes(DEMO_PROJECT_ID)
    candidates = store.get_all_candidates(DEMO_PROJECT_ID)

    pdf_bytes = generate_call_sheet_pdf(project, plan.shooting_days[0], scenes, candidates)
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 500
    assert pdf_bytes.startswith(b"%PDF")


def test_ics_calendar_generation():
    project = store.get_project(DEMO_PROJECT_ID)
    assert project is not None
    plan = store.get_plan(DEMO_PROJECT_ID)
    assert plan is not None
    scenes = store.get_scenes(DEMO_PROJECT_ID)

    ics_str = generate_ics_calendar(project, plan, scenes)
    assert isinstance(ics_str, str)
    assert "BEGIN:VCALENDAR" in ics_str
    assert "VERSION:2.0" in ics_str
    assert "PRODID:-//StudioScout AI//Film Production Assistant//EN" in ics_str
    assert "BEGIN:VEVENT" in ics_str
    assert "SUMMARY:" in ics_str
    assert "END:VCALENDAR" in ics_str


def test_schedule_csv_generation():
    project = store.get_project(DEMO_PROJECT_ID)
    assert project is not None
    plan = store.get_plan(DEMO_PROJECT_ID)
    assert plan is not None
    scenes = store.get_scenes(DEMO_PROJECT_ID)
    candidates = store.get_all_candidates(DEMO_PROJECT_ID)

    csv_str = generate_schedule_csv(project, plan, scenes, candidates)
    assert isinstance(csv_str, str)
    assert "STUDIOSCOUT AI" in csv_str
    assert "Day 1" in csv_str
    assert "Scene #" in csv_str
    assert "Call Time" in csv_str


def test_export_endpoints_http():
    # 1. Production Bible PDF endpoint
    res_bible = client.get(f"/api/projects/{DEMO_PROJECT_ID}/export/production-bible")
    assert res_bible.status_code == 200
    assert res_bible.headers["content-type"] == "application/pdf"
    assert "attachment; filename=" in res_bible.headers["content-disposition"]
    assert res_bible.content.startswith(b"%PDF")

    # 2. Daily Call Sheet PDF endpoint
    res_sheet = client.get(f"/api/projects/{DEMO_PROJECT_ID}/export/call-sheet?day=1")
    assert res_sheet.status_code == 200
    assert res_sheet.headers["content-type"] == "application/pdf"
    assert res_sheet.content.startswith(b"%PDF")

    # 3. Calendar .ICS endpoint
    res_cal = client.get(f"/api/projects/{DEMO_PROJECT_ID}/export/calendar")
    assert res_cal.status_code == 200
    assert "text/calendar" in res_cal.headers["content-type"]
    assert b"BEGIN:VCALENDAR" in res_cal.content

    # 4. Schedule CSV endpoint
    res_csv = client.get(f"/api/projects/{DEMO_PROJECT_ID}/export/schedule")
    assert res_csv.status_code == 200
    assert "text/csv" in res_csv.headers["content-type"]
    assert b"STUDIOSCOUT AI" in res_csv.content
