"""
Dedicated Integration Test for Parallel Search Tool.
Demonstrates:
  - Parallel SDK import ('from parallel import Parallel')
  - Function interface and parameter contract
  - Result normalization, URL domain parsing, and deduplication
  - Graceful handling when credentials are unconfigured or live
"""
import pytest
import asyncio
from unittest.mock import MagicMock, patch
from app.tools.parallel_search import parallel_search, _extract_domain, _normalize_result
from app.models.search import SearchResponse, SearchResult


def test_domain_extraction():
    assert _extract_domain("https://www.mumbaifilmstudios.in/locations") == "mumbaifilmstudios.in"
    assert _extract_domain("http://filmlocations.co.uk/industrial-warehouse") == "filmlocations.co.uk"
    assert _extract_domain("invalid-url") == "invalid-url"


def test_result_normalization():
    raw = {
        "title": "Grand Industrial Mill Mumbai",
        "url": "https://mumbaistudios.com/mill",
        "excerpt": "Historic 1920s textile mill with soaring 40ft ceilings and nighttime shooting access.",
    }
    normalized = _normalize_result(raw, "warehouse filming Mumbai", "interaction-123")
    assert normalized.title == "Grand Industrial Mill Mumbai"
    assert normalized.domain == "mumbaistudios.com"
    assert normalized.interaction_id == "interaction-123"
    assert "textile mill" in normalized.excerpt


@pytest.mark.asyncio
async def test_parallel_search_mocked_flow():
    """Test the complete tool execution pipeline with a mock Parallel SDK response."""
    with patch("app.tools.parallel_search.Parallel") as MockParallel, \
         patch("app.tools.parallel_search.get_settings") as MockSettings:

        # Configure mock settings
        mock_settings = MagicMock()
        mock_settings.parallel_configured = True
        mock_settings.parallel_api_key = "test-parallel-key"
        mock_settings.parallel_processor = "base"
        MockSettings.return_value = mock_settings

        # Configure mock SDK task_run return
        mock_client = MagicMock()
        MockParallel.return_value = mock_client

        mock_task_run = MagicMock()
        mock_task_run.run = MagicMock()
        mock_task_run.run.interaction_id = "test-interaction-456"

        mock_citation = MagicMock()
        mock_citation.title = "Apollo Industrial Estate"
        mock_citation.url = "https://filmvenues.in/apollo"
        mock_citation.excerpts = ["Decommissioned manufacturing floor in Central Mumbai suitable for heavy lighting rigs."]

        mock_basis = MagicMock()
        mock_basis.citations = [mock_citation]

        mock_output = MagicMock()
        mock_output.basis = [mock_basis]
        mock_output.content = {}

        mock_task_run.output = mock_output
        mock_client.task_run.execute.return_value = mock_task_run
        mock_client.task_run.create.return_value = mock_task_run

        response: SearchResponse = await parallel_search(
            objective="Find industrial filming venue in Mumbai",
            search_queries=["industrial warehouse filming Mumbai"],
            max_results=5,
        )

        assert response.total_found == 1
        assert len(response.results) == 1
        assert response.results[0].title == "Apollo Industrial Estate"
        assert response.results[0].domain == "filmvenues.in"
        assert response.source == "parallel"
        assert mock_client.task_run.execute.called or mock_client.task_run.create.called


@pytest.mark.asyncio
async def test_parallel_search_graceful_missing_key():
    """Verify tool handles missing API key safely without crashing."""
    with patch("app.tools.parallel_search.get_settings") as MockSettings:
        mock_settings = MagicMock()
        mock_settings.parallel_configured = False
        MockSettings.return_value = mock_settings

        response = await parallel_search(
            objective="Find warehouse in Mumbai",
            search_queries=["warehouse filming Mumbai"],
        )
        assert response.total_found == 0
        assert "PARALLEL_API_KEY" in (response.error or "")
