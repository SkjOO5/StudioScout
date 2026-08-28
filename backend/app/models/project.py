"""Project data models for StudioScout AI."""
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
import uuid


class Genre(str, Enum):
    ACTION = "action"
    THRILLER = "thriller"
    DRAMA = "drama"
    COMEDY = "comedy"
    HORROR = "horror"
    SCI_FI = "sci-fi"
    ROMANCE = "romance"
    DOCUMENTARY = "documentary"
    ANIMATION = "animation"
    OTHER = "other"


class BudgetTier(str, Enum):
    MICRO = "micro"          # < $100K
    LOW = "low"              # $100K - $1M
    MID = "mid"              # $1M - $10M
    HIGH = "high"            # $10M - $100M
    BLOCKBUSTER = "blockbuster"  # > $100M


class ProjectStatus(str, Enum):
    CREATED = "created"
    ANALYZING = "analyzing"
    RESEARCHING = "researching"
    PLANNING = "planning"
    COMPLETED = "completed"
    FAILED = "failed"


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Project name")
    genre: Genre = Genre.THRILLER
    production_city: str = Field(..., min_length=1, max_length=100, description="Primary shooting city")
    budget_tier: BudgetTier = BudgetTier.MID
    scene_description: Optional[str] = Field(None, description="Plain text scene description if no PDF")


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    genre: Optional[Genre] = None
    production_city: Optional[str] = None
    budget_tier: Optional[BudgetTier] = None


class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    genre: Genre
    production_city: str
    budget_tier: BudgetTier
    status: ProjectStatus = ProjectStatus.CREATED
    scene_description: Optional[str] = None
    screenplay_filename: Optional[str] = None
    screenplay_text: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    current_run_id: Optional[str] = None
    scene_count: int = 0
    has_recommendations: bool = False
    has_plan: bool = False

    model_config = {"from_attributes": True}
