"""
StudioScout AI — Hugging Face Spaces & Production Entry Point
Runs the FastAPI application that serves both the AI backend and React 19 Frontend SPA.
"""
import os
import sys

# Priority 1: Prevent app.py from shadowing backend/app package
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "backend")

# Ensure backend directory is first in sys.path and root directory is removed from head
sys.path = [p for p in sys.path if p not in (current_dir, "")]
sys.path.insert(0, backend_dir)
if "app" in sys.modules and not hasattr(sys.modules["app"], "__path__"):
    del sys.modules["app"]

# Import the actual FastAPI application from backend/app/main
import app.main as app_main
fastapi_app = app_main.app
from app.config import get_settings

# Hugging Face Spaces Gradio integration
try:
    import gradio as gr

    def create_gradio_ui():
        with gr.Blocks(title="StudioScout AI 🎬") as demo_blocks:
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
        return demo_blocks

    demo = create_gradio_ui()
    app = gr.mount_gradio_app(fastapi_app, demo, path="/gradio")
except Exception:
    app = fastapi_app
    demo = None

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(app, host="0.0.0.0", port=port)
