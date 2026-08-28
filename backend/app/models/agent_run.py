"""Agent run models for StudioScout AI."""
from datetime import datetime
from enum import Enum
from typing import Optional, List, Any
from pydantic import BaseModel, Field
import uuid


class RunState(str, Enum):
    QUEUED = "queued"
    ANALYZING = "analyzing"
    RESEARCHING = "researching"
    EVALUATING = "evaluating"
    PLANNING = "planning"
    REPLANNING = "replanning"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class StepStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


class AgentStep(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    run_id: str
    step_index: int
    name: str  # Human-readable step name
    status: StepStatus = StepStatus.PENDING
    detail: Optional[str] = None  # Additional info visible to user
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_ms: Optional[int] = None
    tool_used: Optional[str] = None  # e.g. "parallel_search", "gemini"
    error: Optional[str] = None

    model_config = {"from_attributes": True}


class AgentRun(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    state: RunState = RunState.QUEUED
    run_type: str = "scout"  # scout, replan
    steps: List[AgentStep] = Field(default_factory=list)
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    total_duration_ms: Optional[int] = None
    scenes_processed: int = 0
    searches_performed: int = 0
    candidates_found: int = 0
    error: Optional[str] = None
    replan_reason: Optional[str] = None

    model_config = {"from_attributes": True}
