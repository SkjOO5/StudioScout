"""
StudioScout AI — Parallel Search Tool

This module is the REAL runtime integration with the Parallel Search API.
It uses the official 'parallel-web' Python SDK to call Parallel's search service.

The runtime flow:
  Agent → parallel_search() → Parallel SDK → Parallel Search API → results → Agent
"""
import asyncio
import logging
import re
from typing import Optional
from urllib.parse import urlparse

# ─── PARALLEL SDK IMPORT ──────────────────────────────────────────────────────
# This is the official parallel-web SDK from https://pypi.org/project/parallel-web/
# Install: pip install "parallel-web>=1.0.1"
from parallel import Parallel, AsyncParallel  # type: ignore

from app.config import get_settings
from app.models.search import SearchRequest, SearchResponse, SearchResult

logger = logging.getLogger(__name__)


def _extract_domain(url: str) -> str:
    """Extract clean domain from a URL."""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        if domain.startswith("www."):
            domain = domain[4:]
        return domain if domain else (parsed.path or url)
    except Exception:
        return url


def _normalize_result(raw_result: dict, query_used: str, interaction_id: str) -> SearchResult:
    """
    Normalize a raw Parallel API result into our SearchResult model.
    This is the boundary between the external API and our internal data model.
    """
    title = raw_result.get("title", "Untitled")
    url = raw_result.get("url", "")
    # Parallel returns LLM-optimized excerpts in various fields
    excerpt = (
        raw_result.get("excerpt", "")
        or raw_result.get("snippet", "")
        or raw_result.get("content", "")
        or raw_result.get("text", "")
        or ""
    )
    # Truncate excerpt to a reasonable length for display
    if len(excerpt) > 500:
        excerpt = excerpt[:497] + "..."

    return SearchResult(
        title=title,
        url=url,
        domain=_extract_domain(url),
        excerpt=excerpt,
        query_used=query_used,
        interaction_id=interaction_id,
    )



async def parallel_search(
    objective: str,
    search_queries: list[str],
    max_results: int = 10,
) -> SearchResponse:
    """
    Execute real-world web search via the Parallel Search API.

    This function is the cornerstone of StudioScout's research capability.
    It calls Parallel's Search API synchronously (in a thread pool to avoid
    blocking the async event loop) and returns normalized results.

    Args:
        objective: High-level research goal (e.g. "Find industrial filming locations in Mumbai")
        search_queries: List of specific search queries to run
        max_results: Maximum number of results to return after deduplication

    Returns:
        SearchResponse with real results from Parallel's web search
    """
    settings = get_settings()

    if not settings.parallel_configured:
        logger.warning("PARALLEL_API_KEY not configured. Cannot perform web search.")
        return SearchResponse(
            objective=objective,
            queries_run=search_queries,
            results=[],
            total_found=0,
            error="PARALLEL_API_KEY not configured. Set PARALLEL_API_KEY in your .env file.",
        )

    logger.info(f"[ParallelSearch] Starting search | objective='{objective}' | queries={len(search_queries)}")

    all_results: list[SearchResult] = []
    seen_urls: set[str] = set()
    queries_run: list[str] = []

    try:
        # ─── PARALLEL API CALL ────────────────────────────────────────────────
        # We use the synchronous Parallel client in a thread executor to keep
        # the FastAPI async event loop unblocked.
        client = Parallel(api_key=settings.parallel_api_key)

        async def run_single_query(query: str) -> list[SearchResult]:
            """Run one Parallel search query and normalize results."""
            try:
                logger.info(f"[ParallelSearch] Calling Parallel API | query='{query}'")

                # ─── ACTUAL PARALLEL SDK CALL ──────────────────────────────────
                # client.task_run.execute() sends the query to Parallel's search service
                # and synchronously returns the completed TaskRunResult with citations.
                task_result = await asyncio.to_thread(
                    client.task_run.execute,
                    input=query,
                    processor=settings.parallel_processor,
                )

                run_obj = getattr(task_result, "run", None)
                interaction_id = getattr(run_obj, "interaction_id", getattr(run_obj, "run_id", "unknown")) if run_obj else "unknown"
                logger.info(f"[ParallelSearch] Parallel API responded | interaction_id={interaction_id}")

                results_data = []

                # 1. Extract from basis citations
                output_obj = getattr(task_result, "output", None)
                if output_obj:
                    basis_list = getattr(output_obj, "basis", []) or []
                    for basis_item in basis_list:
                        citations = getattr(basis_item, "citations", []) or []
                        for cit in citations:
                            cit_url = getattr(cit, "url", "")
                            cit_title = getattr(cit, "title", query) or query
                            cit_excerpts = getattr(cit, "excerpts", []) or []
                            excerpt_text = " ".join(cit_excerpts) if cit_excerpts else getattr(basis_item, "reasoning", "")
                            results_data.append({
                                "title": cit_title,
                                "url": cit_url,
                                "excerpt": excerpt_text,
                            })

                    # If no basis citations, check content
                    content = getattr(output_obj, "content", None)
                    if isinstance(content, dict) and not results_data:
                        for k, v in content.items():
                            if v:
                                results_data.append({
                                    "title": f"Parallel Search: {query}",
                                    "url": "",
                                    "excerpt": str(v),
                                })
                    elif isinstance(content, str) and content.strip() and not results_data:
                        results_data.append({
                            "title": f"Parallel Search: {query}",
                            "url": "",
                            "excerpt": content,
                        })

                # 2. Check sources field
                sources = getattr(task_result, "sources", None)
                if isinstance(sources, list) and sources:
                    for src in sources:
                        if isinstance(src, dict):
                            results_data.append(src)
                        elif hasattr(src, "__dict__"):
                            results_data.append({k: v for k, v in vars(src).items() if not k.startswith("_")})

                batch = []
                for raw in results_data:
                    if isinstance(raw, dict):
                        normalized = _normalize_result(raw, query, str(interaction_id))
                        batch.append(normalized)

                logger.info(f"[ParallelSearch] Query '{query}' returned {len(batch)} results")
                return batch

            except Exception as e:
                logger.error(f"[ParallelSearch] Query failed: '{query}' | error={e!r}")
                return []

        # Run all queries (sequentially to avoid rate limiting on basic tier)
        for query in search_queries:
            queries_run.append(query)
            batch = await run_single_query(query)
            # Deduplicate by URL
            for result in batch:
                if result.url and result.url not in seen_urls:
                    seen_urls.add(result.url)
                    all_results.append(result)
                elif not result.url:
                    # Summary results without URL — include them
                    all_results.append(result)

            # Stop if we have enough results
            if len(all_results) >= max_results:
                break

        # Trim to max_results
        all_results = all_results[:max_results]

        logger.info(
            f"[ParallelSearch] Complete | total_unique_results={len(all_results)} | "
            f"queries_run={len(queries_run)}"
        )

        return SearchResponse(
            objective=objective,
            queries_run=queries_run,
            results=all_results,
            total_found=len(all_results),
        )

    except Exception as e:
        logger.error(f"[ParallelSearch] Fatal error: {e!r}")
        return SearchResponse(
            objective=objective,
            queries_run=queries_run,
            results=all_results,  # Return whatever we got before failure
            total_found=len(all_results),
            error=f"Parallel Search encountered an error: {str(e)}",
        )
