"""Location candidate models for StudioScout AI."""
from typing import Optional, List
from pydantic import BaseModel, Field
import uuid


class ScoreBreakdown(BaseModel):
    visual_match: float = Field(0, ge=0, le=25, description="Visual aesthetic match (0-25)")
    location_requirements: float = Field(0, ge=0, le=20, description="Technical requirements met (0-20)")
    accessibility: float = Field(0, ge=0, le=15, description="Crew & vehicle access (0-15)")
    time_lighting: float = Field(0, ge=0, le=15, description="Time of day / lighting suitability (0-15)")
    production_practicality: float = Field(0, ge=0, le=15, description="Production feasibility (0-15)")
    risk_score: float = Field(0, ge=0, le=10, description="Risk level (higher = lower risk, 0-10)")

    @property
    def total(self) -> float:
        return (self.visual_match + self.location_requirements + self.accessibility +
                self.time_lighting + self.production_practicality + self.risk_score)


class Evidence(BaseModel):
    requirement: str
    excerpt: str
    source_url: str
    source_title: str
    confidence: str = "medium"  # high, medium, low


class Risk(BaseModel):
    category: str  # permit, access, weather, noise, safety, logistics
    description: str
    severity: str  # low, medium, high, critical
    mitigation: str


class LocationCandidate(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    scene_id: str
    project_id: str
    name: str
    description: str
    location_type: str
    address_hint: Optional[str] = None
    city: str
    match_score: float = Field(0, ge=0, le=100)
    score_breakdown: ScoreBreakdown = Field(default_factory=ScoreBreakdown)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    risks: List[Risk] = Field(default_factory=list)
    evidence: List[Evidence] = Field(default_factory=list)
    sources: List[str] = Field(default_factory=list)  # URLs
    recommended_action: str = ""
    rank: int = 0

    model_config = {"from_attributes": True}
