"""
StudioScout AI — Hugging Face Spaces & Production Entry Point
Runs the unified Gradio + FastAPI application for autonomous film pre-production.
"""
import os
import sys

# Priority 1: Prevent app.py from shadowing backend/app package
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "backend")

# Ensure backend directory is first in sys.path
sys.path = [p for p in sys.path if p not in (current_dir, "")]
sys.path.insert(0, backend_dir)
if "app" in sys.modules and not hasattr(sys.modules["app"], "__path__"):
    del sys.modules["app"]

import gradio as gr
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.api.projects import router as projects_router
from app.api.runs import router as runs_router
from app.api.storyboards import router as storyboards_router
from app.api.audio import router as audio_router
from app.api.tableread import router as tableread_router
from app.api.exports import router as exports_router
from app.demo_seed import seed_demo_project
from app.store import store

settings = get_settings()

# Create upload directory
os.makedirs(settings.upload_dir, exist_ok=True)

# Seed initial showcase demo project if database is empty
if not store.list_projects():
    try:
        seed_demo_project()
    except Exception as e:
        print(f"[Startup] Demo seed notice: {e}")

# Build the Gradio UI
with gr.Blocks(title="StudioScout AI 🎬") as demo:
    gr.Markdown(
        """
        # 🎬 StudioScout AI
        ### Autonomous Film Pre-Production & Location Intelligence Operating System

        The StudioScout AI backend is **active and ready**.

        - 📖 **Interactive API Documentation (Swagger)**: [/docs](/docs)
        - 🩺 **Health Check**: [/api/health](/api/health)
        - 🚀 **Projects API**: [/api/projects](/api/projects)
        """
    )
    with gr.Row():
        with gr.Column():
            gr.Markdown("### 📊 Live System Status")
            status_btn = gr.Button("Query System Status", variant="primary")
            status_output = gr.JSON(label="System Status & AI Config")

            def get_status():
                s = get_settings()
                return {
                    "status": "online",
                    "version": s.app_version,
                    "gemini_configured": s.gemini_configured,
                    "parallel_configured": s.parallel_configured,
                    "gemini_model": s.gemini_model,
                    "environment": s.app_env,
                    "database": "SQLite (Durable WAL)",
                    "projects_loaded": len(store.list_projects()),
                }
            status_btn.click(fn=get_status, outputs=status_output)

# Attach CORS Middleware so Vercel frontend can query this backend
demo.app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach all FastAPI backend routers to demo.app
demo.app.include_router(projects_router, prefix="/api", tags=["projects"])
demo.app.include_router(runs_router, prefix="/api", tags=["runs"])
demo.app.include_router(storyboards_router, prefix="/api", tags=["storyboards"])
demo.app.include_router(audio_router, prefix="/api", tags=["audio"])
demo.app.include_router(tableread_router, prefix="/api", tags=["tableread"])
demo.app.include_router(exports_router, prefix="/api", tags=["exports"])


# Health & status endpoints
@demo.app.get("/health")
@demo.app.get("/api/health")
async def health():
    s = get_settings()
    return {
        "status": "ok",
        "version": s.app_version,
        "database": "sqlite_local",
        "gemini_configured": s.gemini_configured,
        "parallel_configured": s.parallel_configured,
        "gemini_model": s.gemini_model,
    }


@demo.app.get("/api/status")
async def api_status():
    s = get_settings()
    return {
        "app": s.app_name,
        "version": s.app_version,
        "env": s.app_env,
        "ai": {"configured": s.gemini_configured, "model": s.gemini_model},
        "search": {"configured": s.parallel_configured},
    }


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    demo.launch(server_name="0.0.0.0", server_port=port, ssr=False)
