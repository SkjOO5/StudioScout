"""API routes integration tests."""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.store import store

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "gemini_model" in data
    assert "database" in data


def test_status_endpoint():
    response = client.get("/api/status")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == "StudioScout AI"
    assert data["ai"]["provider"] == "Google Gemini"
    assert data["search"]["provider"] == "Parallel Search"
    assert data["database"]["engine"] == "SQLite"


def test_demo_seed_endpoint():
    from app.demo_seed import DEMO_PROJECT_ID
    response = client.post("/api/demo/seed")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["project_id"] == DEMO_PROJECT_ID

    # Verify project exists
    get_res = client.get(f"/api/projects/{DEMO_PROJECT_ID}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Cipher Zero"

    # Verify scenes exist
    scenes_res = client.get(f"/api/projects/{DEMO_PROJECT_ID}/scenes")
    assert scenes_res.status_code == 200
    assert len(scenes_res.json()) == 4

    # Verify plan exists
    plan_res = client.get(f"/api/projects/{DEMO_PROJECT_ID}/plan")
    assert plan_res.status_code == 200
    assert plan_res.json()["total_days"] == 3


def test_project_crud_flow():
    # 1. Create Project
    response = client.post(
        "/api/projects",
        data={
            "name": "Api Test Thriller",
            "genre": "thriller",
            "production_city": "Mumbai",
            "budget_tier": "mid",
            "scene_description": "INT. WAREHOUSE - NIGHT\nArjun hides among industrial crates.",
        },
    )
    assert response.status_code == 200
    project = response.json()
    project_id = project["id"]
    assert project["name"] == "Api Test Thriller"
    assert project["production_city"] == "Mumbai"

    # 2. Get Project
    get_res = client.get(f"/api/projects/{project_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == project_id

    # 3. List Projects
    list_res = client.get("/api/projects")
    assert list_res.status_code == 200
    ids = [p["id"] for p in list_res.json()]
    assert project_id in ids

    # 4. Update Project (PATCH)
    patch_res = client.patch(f"/api/projects/{project_id}", json={"name": "Updated Title", "production_city": "London"})
    assert patch_res.status_code == 200
    assert patch_res.json()["name"] == "Updated Title"
    assert patch_res.json()["production_city"] == "London"

    # 5. Add Scene (POST)
    scene_res = client.post(
        f"/api/projects/{project_id}/scenes",
        json={
            "scene_number": 1,
            "heading": "EXT. ROOFTOP - NIGHT",
            "location": "Rooftop Deck",
            "location_type": "commercial",
            "time_of_day": "night",
            "setting": "exterior",
        }
    )
    assert scene_res.status_code == 200
    scene = scene_res.json()
    scene_id = scene["id"]
    assert scene["heading"] == "EXT. ROOFTOP - NIGHT"

    # 6. Update Scene (PATCH)
    update_scene_res = client.patch(
        f"/api/projects/{project_id}/scenes/{scene_id}",
        json={"location": "Penthouse Helipad"}
    )
    assert update_scene_res.status_code == 200
    assert update_scene_res.json()["location"] == "Penthouse Helipad"

    # 7. Delete Scene (DELETE)
    del_scene_res = client.delete(f"/api/projects/{project_id}/scenes/{scene_id}")
    assert del_scene_res.status_code == 200

    # 8. Delete Project (DELETE)
    del_res = client.delete(f"/api/projects/{project_id}")
    assert del_res.status_code == 200

    # 9. Verify Project is deleted
    get_del_res = client.get(f"/api/projects/{project_id}")
    assert get_del_res.status_code == 404


def test_root_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_rate_limiter_logic():
    from app.rate_limiter import SlidingWindowRateLimiter
    from fastapi import Request, HTTPException

    limiter = SlidingWindowRateLimiter(limit=3, window_seconds=10)

    class DummyClient:
        host = "192.168.1.100"

    class DummyRequest:
        client = DummyClient()
        headers = {}

    req = DummyRequest()

    # First 3 should pass
    assert limiter(req) is True
    assert limiter(req) is True
    assert limiter(req) is True

    # 4th should trigger 429
    with pytest.raises(HTTPException) as exc_info:
        limiter(req)
    assert exc_info.value.status_code == 429


