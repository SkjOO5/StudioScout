"""
StudioScout AI — Hugging Face Spaces & Production Entry Point
Runs the unified FastAPI + Gradio application for autonomous film pre-production.
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

from app.main import app as fastapi_app
from app.config import get_settings

try:
    import gradio as gr

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
                    settings = get_settings()
                    return {
                        "status": "online",
                        "version": settings.app_version,
                        "gemini_configured": settings.gemini_configured,
                        "parallel_configured": settings.parallel_configured,
                        "gemini_model": settings.gemini_model,
                        "environment": settings.app_env,
                    }
                status_btn.click(fn=get_status, outputs=status_output)

    # Mount Gradio onto the FastAPI application
    app = gr.mount_gradio_app(fastapi_app, demo, path="/gradio")
except Exception:
    app = fastapi_app
    demo = None

if __name__ == "__main__":
    if demo is not None:
        demo.launch(server_name="0.0.0.0", server_port=int(os.environ.get("PORT", 7860)), app=app)
    else:
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 7860)))
