"""Tests for Pydantic data models and schemas."""
import pytest
from app.models.project import Project, Genre, BudgetTier, ProjectStatus
from app.models.scene import Scene, SceneRequirement
from app.models.candidate import LocationCandidate, ScoreBreakdown, Risk, Evidence
from app.models.plan import ProductionPlan, ShootingDay, ShootingBlock, PlanConstraint
from app.models.agent_run import AgentRun, AgentStep, RunState, StepStatus
from app.models.search import SearchResult, SearchResponse


def test_project_model_defaults():
    project = Project(
        name="Test Production",
        genre=Genre.ACTION,
        production_city="Mumbai",
        budget_tier=BudgetTier.MID,
    )
    assert project.id is not None
    assert project.status == ProjectStatus.CREATED
    assert project.scene_count == 0
    assert project.has_recommendations is False


def test_score_breakdown_calculation():
    breakdown = ScoreBreakdown(
        visual_match=23.5,
        location_requirements=18.0,
        accessibility=14.0,
        time_lighting=13.5,
        production_practicality=14.0,
        risk_score=9.0,
    )
    assert breakdown.total == 92.0


def test_score_breakdown_constraints():
    # Validates bounded scores
    breakdown = ScoreBreakdown(
        visual_match=25.0,
        location_requirements=20.0,
        accessibility=15.0,
        time_lighting=15.0,
        production_practicality=15.0,
        risk_score=10.0,
    )
    assert breakdown.total == 100.0


def test_scene_model():
    req = SceneRequirement(
        category="space",
        description="High ceiling industrial warehouse",
        priority="required"
    )
    scene = Scene(
        project_id="proj-123",
        scene_number=1,
        heading="INT. WAREHOUSE - NIGHT",
        location="Warehouse",
        location_type="industrial",
        time_of_day="night",
        setting="interior",
        characters=3,
        vehicles=True,
        requirements=[req],
    )
    assert scene.scene_number == 1
    assert scene.vehicles is True
    assert len(scene.requirements) == 1
    assert scene.requirements[0].priority == "required"


def test_search_response_normalization():
    res = SearchResult(
        title="Film Location Mumbai",
        url="https://example.com/venue",
        domain="example.com",
        excerpt="50,000 sq ft warehouse available for production.",
    )
    response = SearchResponse(
        objective="Find warehouse in Mumbai",
        queries_run=["warehouse filming location Mumbai"],
        results=[res],
        total_found=1,
    )
    assert response.total_found == 1
    assert response.results[0].domain == "example.com"
    assert response.source == "parallel"
