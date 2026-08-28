"""
StudioScout AI — Main FastAPI Application

Entry point for the backend API server.
"""
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.api.projects import router as projects_router
from app.api.runs import router as runs_router
from app.api.storyboards import router as storyboards_router
from app.api.audio import router as audio_router
from app.api.tableread import router as tableread_router
from app.api.exports import router as exports_router
from app.demo_seed import seed_demo_project, DEMO_PROJECT_ID
from app.store import store


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown."""
    settings = get_settings()
    logger.info("╔══════════════════════════════════════════════════╗")
    logger.info(f"║  StudioScout AI v{settings.app_version} starting up            ║")
    logger.info(f"║  Database: SQLite (Durable Persistence)          ║")
    logger.info(f"║  Environment: {settings.app_env:<35}║")
    logger.info(f"║  Gemini configured: {'YES' if settings.gemini_configured else 'NO (set GOOGLE_API_KEY)':>28}║")
    logger.info(f"║  Parallel configured: {'YES' if settings.parallel_configured else 'NO (set PARALLEL_API_KEY)':>26}║")
    logger.info("╚══════════════════════════════════════════════════╝")

    # Create upload directory
    os.makedirs(settings.upload_dir, exist_ok=True)

    # Automatically seed demo project if no projects exist in database
    if not store.list_projects():
        logger.info("[Startup] Seeding initial 'Cipher Zero' demo project for instant judging...")
        try:
            seed_demo_project()
        except Exception as e:
            logger.warning(f"[Startup] Demo seed notice: {e}")

    yield

    logger.info("StudioScout AI shutting down")


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="StudioScout AI",
        description="Autonomous AI production-planning assistant for filmmakers, location scouts, and studio crews",
        version=settings.app_version,
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        lifespan=lifespan,
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # API routes
    app.include_router(projects_router, prefix="/api", tags=["projects"])
    app.include_router(runs_router, prefix="/api", tags=["runs"])
    app.include_router(storyboards_router, prefix="/api", tags=["storyboards"])
    app.include_router(audio_router, prefix="/api", tags=["audio"])
    app.include_router(tableread_router, prefix="/api", tags=["tableread"])
    app.include_router(exports_router, prefix="/api", tags=["exports"])

    # Health checks (both root and /api/health)
    @app.get("/health")
    @app.get("/api/health")
    async def health():
        settings = get_settings()
        return {
            "status": "ok",
            "version": settings.app_version,
            "database": "sqlite_local",
            "gemini_configured": settings.gemini_configured,
            "parallel_configured": settings.parallel_configured,
            "gemini_model": settings.gemini_model,
        }

    # Status endpoint
    @app.get("/api/status")
    async def status():
        settings = get_settings()
        return {
            "app": settings.app_name,
            "version": settings.app_version,
            "env": settings.app_env,
            "database": {
                "engine": "SQLite",
                "mode": "WAL",
                "persistent": True,
                "path": store.db_path,
            },
            "ai": {
                "provider": "Google Gemini",
                "model": settings.gemini_model,
                "configured": settings.gemini_configured,
                "vertex_ai": settings.google_genai_use_vertexai,
            },
            "search": {
                "provider": "Parallel Search",
                "configured": settings.parallel_configured,
                "processor": settings.parallel_processor,
            },
        }

    # Demo seed endpoint
    @app.post("/api/demo/seed")
    async def seed_demo():
        """Seed or reset the 'Neon Shadows' showcase demo project."""
        try:
            proj = seed_demo_project()
            return {
                "status": "success",
                "message": "Demo project 'Neon Shadows' seeded successfully",
                "project_id": proj.id,
                "scene_count": proj.scene_count,
            }
        except Exception as e:
            logger.error(f"[API] Demo seeding failed: {e}")
            return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

    # Optional: Serve production frontend SPA if dist folder is present
    dist_paths = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
        "/app/frontend/dist",
        "/app/dist",
    ]
    dist_dir = next((p for p in dist_paths if os.path.exists(p) and os.path.isdir(p)), None)
    if dist_dir:
        from fastapi.staticfiles import StaticFiles
        from fastapi.responses import FileResponse
        assets_dir = os.path.join(dist_dir, "assets")
        if os.path.exists(assets_dir):
            app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

        @app.get("/{full_path:path}")
        async def serve_spa(full_path: str):
            if full_path.startswith("api/"):
                return JSONResponse(status_code=404, content={"detail": "Not Found"})
            file_path = os.path.join(dist_dir, full_path)
            if os.path.isfile(file_path):
                return FileResponse(file_path)
            index_path = os.path.join(dist_dir, "index.html")
            if os.path.isfile(index_path):
                return FileResponse(index_path)
            return JSONResponse(status_code=404, content={"detail": "Frontend bundle not found"})

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
