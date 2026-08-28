"""Production plan models for StudioScout AI."""
from typing import Optional, List
from pydantic import BaseModel, Field
import uuid


class ShootingBlock(BaseModel):
    start_time: str  # e.g. "08:00"
    end_time: str    # e.g. "10:30"
    activity: str
    scene_id: Optional[str] = None
    scene_number: Optional[int] = None
    location: Optional[str] = None
    notes: Optional[str] = None


class ShootingDay(BaseModel):
    day_number: int
    date_label: str  # e.g. "Day 1" or "Mon 2 Sep"
    location: str
    call_time: str
    wrap_time: str
    blocks: List[ShootingBlock] = Field(default_factory=list)
    crew_size: int = 0
    complexity: str = "medium"  # low, medium, high
    notes: List[str] = Field(default_factory=list)


class PlanConstraint(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # availability, weather, budget, permit, other
    description: str
    affects_scene_ids: List[str] = Field(default_factory=list)
    affects_location: Optional[str] = None


class ProductionPlan(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    version: int = 1
    shooting_days: List[ShootingDay] = Field(default_factory=list)
    total_days: int = 0
    constraints: List[PlanConstraint] = Field(default_factory=list)
    overall_risks: List[str] = Field(default_factory=list)
    dependencies: List[str] = Field(default_factory=list)
    recommended_actions: List[str] = Field(default_factory=list)
    summary: str = ""
    replan_reason: Optional[str] = None
    previous_version_id: Optional[str] = None

    model_config = {"from_attributes": True}


class ReplanRequest(BaseModel):
    constraint: str = Field(..., description="New constraint description")
    constraint_type: str = Field(default="availability", description="Type of constraint")
    affects_location: Optional[str] = None
    affects_scene_ids: List[str] = Field(default_factory=list)
