"""
StudioScout AI — Configuration

All configuration is loaded from environment variables.
Never put real credentials in this file.
"""
from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
import os


class Settings(BaseSettings):
    # ─── Google Cloud / Gemini ─────────────────────────────────────────────────
    # Use EITHER google_api_key (AI Studio) OR vertex_ai config (Cloud)
    google_api_key: Optional[str] = None
    google_cloud_project: Optional[str] = None
    google_cloud_location: str = "us-central1"
    # Set to "true" to use Vertex AI instead of AI Studio
    google_genai_use_vertexai: bool = False
    # Gemini model name — default to gemini-3.1-flash
    gemini_model: str = "gemini-3.1-flash"

    # ─── Parallel Search ──────────────────────────────────────────────────────
    parallel_api_key: Optional[str] = None
    parallel_processor: str = "base"  # base or pro

    # ─── Application ──────────────────────────────────────────────────────────
    app_env: str = "development"
    app_name: str = "StudioScout AI"
    app_version: str = "1.0.0"
    debug: bool = False

    # ─── Agent Safety Limits & Cost Protection ────────────────────────────────
    max_agent_steps: int = 25
    max_searches_per_run: int = 10
    max_run_time_seconds: int = 300
    max_tool_calls: int = 20

    # ─── Rate Limiting (Per-Instance Sliding Window) ───────────────────────────
    rate_limit_enabled: bool = True
    rate_limit_per_minute: int = 15

    # ─── CORS ─────────────────────────────────────────────────────────────────
    cors_origins: str = "http://localhost:5173,http://localhost:4173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:4173,*"

    # ─── File Upload ──────────────────────────────────────────────────────────
    max_upload_size_mb: int = 20
    upload_dir: str = "/tmp/studioscout_uploads"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def gemini_configured(self) -> bool:
        return bool(self.google_api_key or (self.google_cloud_project and self.google_genai_use_vertexai))

    @property
    def parallel_configured(self) -> bool:
        return bool(self.parallel_api_key)


def get_settings() -> Settings:
    """Return application settings, loaded fresh from .env each call."""
    return Settings()
