"""Scene data models for StudioScout AI."""
from typing import Optional, List
from pydantic import BaseModel, Field
import uuid


class SceneRequirement(BaseModel):
    category: str  # location_type, lighting, access, space, etc.
    description: str
    priority: str = "required"  # required, preferred, optional


class Scene(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    scene_number: int
    heading: str  # INT. WAREHOUSE - NIGHT
    location: str  # Warehouse
    location_type: str  # industrial, residential, exterior, etc.
    time_of_day: str  # day, night, dusk, dawn
    setting: str  # interior, exterior, both
    description: Optional[str] = None
    characters: int = 0
    vehicles: bool = False
    props: List[str] = Field(default_factory=list)
    special_constraints: List[str] = Field(default_factory=list)
    requirements: List[SceneRequirement] = Field(default_factory=list)
    research_status: str = "pending"  # pending, researching, completed, failed
    recommendation_status: str = "pending"  # pending, available, failed

    model_config = {"from_attributes": True}


class SceneCreate(BaseModel):
    scene_number: int
    heading: str
    location: str
    location_type: str = "industrial"
    time_of_day: str = "night"
    setting: str = "interior"
    description: Optional[str] = None
    characters: int = 0
    vehicles: bool = False
    props: List[str] = Field(default_factory=list)
    special_constraints: List[str] = Field(default_factory=list)
    requirements: List[SceneRequirement] = Field(default_factory=list)


class SceneUpdate(BaseModel):
    scene_number: Optional[int] = None
    heading: Optional[str] = None
    location: Optional[str] = None
    location_type: Optional[str] = None
    time_of_day: Optional[str] = None
    setting: Optional[str] = None
    description: Optional[str] = None
    characters: Optional[int] = None
    vehicles: Optional[bool] = None
    props: Optional[List[str]] = None
    special_constraints: Optional[List[str]] = None
    requirements: Optional[List[SceneRequirement]] = None

