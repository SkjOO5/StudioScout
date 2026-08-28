"""Search data models for StudioScout AI."""
from typing import Optional, List
from pydantic import BaseModel, Field
import uuid


class SearchRequest(BaseModel):
    objective: str = Field(..., description="What we are trying to find out")
    queries: List[str] = Field(..., description="Individual search query strings")
    scene_id: Optional[str] = None
    max_results: int = Field(default=10, ge=1, le=50)


class SearchResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    url: str
    domain: str = ""
    excerpt: str = ""
    relevant_to: Optional[str] = None  # scene requirement it supports
    query_used: Optional[str] = None
    interaction_id: Optional[str] = None  # Parallel interaction ID

    model_config = {"from_attributes": True}


class SearchResponse(BaseModel):
    search_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    objective: str
    queries_run: List[str]
    results: List[SearchResult]
    total_found: int
    source: str = "parallel"  # Always "parallel" to be transparent
    error: Optional[str] = None
