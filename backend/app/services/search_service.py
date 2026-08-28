"""
StudioScout AI — Search Service

Orchestrates the Parallel Search strategy for a given scene.
Generates focused, targeted search queries rather than one broad search.
"""
import logging
from app.models.scene import Scene
from app.models.search import SearchRequest, SearchResponse
from app.tools.parallel_search import parallel_search

logger = logging.getLogger(__name__)


def _generate_search_queries(scene: Scene, city: str) -> list[str]:
    """
    Generate focused search queries for a scene's location requirements.

    Instead of one broad query, generate 3-5 targeted searches
    to maximize useful results from Parallel.
    """
    location = scene.location.lower()
    location_type = scene.location_type.lower()
    time = scene.time_of_day
    setting = scene.setting.lower()

    queries = []

    # Query 1: Core location type + city (filming specific)
    queries.append(f"{location} filming location {city}")

    # Query 2: Location type + production needs
    if "industrial" in location_type or "warehouse" in location_type:
        queries.append(f"industrial warehouse film production venue {city} rental")
    elif "residential" in location_type or "apartment" in location_type:
        queries.append(f"apartment house filming location permit {city}")
    elif "hospital" in location_type or "medical" in location_type:
        queries.append(f"hospital medical facility film shoot location {city}")
    elif "rooftop" in location_type or "roof" in location.lower():
        queries.append(f"rooftop filming location permit access {city}")
    elif "parking" in location_type or "garage" in location.lower():
        queries.append(f"parking garage underground film production {city}")
    elif "exterior" in setting or "outdoor" in location_type:
        queries.append(f"outdoor filming location permit {city} {location_type}")
    else:
        queries.append(f"{location_type} location film production permit {city}")

    # Query 3: Night/time-specific if needed
    if time in ("night", "dusk", "dawn"):
        queries.append(f"{location} night filming permission access {city}")

    # Query 4: Vehicle-specific if needed
    if scene.vehicles:
        queries.append(f"{location} vehicle access large trucks film production {city}")

    # Query 5: General film location search in city
    queries.append(f"film shooting location {city} {location_type} permission")

    return queries[:2]  # Top 2 most targeted queries per scene for optimal speed and depth


async def search_for_scene(
    scene: Scene,
    city: str,
    max_results: int = 12,
) -> SearchResponse:
    """
    Perform a multi-query Parallel Search for a scene's location requirements.

    Args:
        scene: Scene requiring location research
        city: Production city
        max_results: Max results to return

    Returns:
        SearchResponse with aggregated, deduplicated results
    """
    objective = (
        f"Find suitable film production locations matching a "
        f"'{scene.location}' scene ({scene.location_type}, {scene.time_of_day}) "
        f"in {city}, including access requirements, permits, and venue details."
    )

    queries = _generate_search_queries(scene, city)

    logger.info(
        f"[SearchService] Searching for Scene {scene.scene_number} | "
        f"location='{scene.location}' | city={city} | queries={len(queries)}"
    )
    logger.debug(f"[SearchService] Queries: {queries}")

    response = await parallel_search(
        objective=objective,
        search_queries=queries,
        max_results=max_results,
    )

    # Tag results with relevant requirements
    for result in response.results:
        # Simple heuristic: tag each result with the primary requirement it might support
        if scene.requirements:
            result.relevant_to = scene.requirements[0].description

    return response
