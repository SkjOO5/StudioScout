"""
StudioScout AI — In-Memory Rate Limiter

Provides per-instance sliding-window rate limiting for expensive API endpoints.
Combines with Cloud Run max-instance bounds for cost control and abuse prevention.
"""
import time
import threading
from typing import Dict, List
from fastapi import Request, HTTPException, status
from app.config import get_settings


class SlidingWindowRateLimiter:
    """Thread-safe in-memory sliding window rate limiter per client IP."""

    def __init__(self, limit: int = 15, window_seconds: int = 60):
        self.limit = limit
        self.window_seconds = window_seconds
        self._lock = threading.Lock()
        self._requests: Dict[str, List[float]] = {}

    def _get_client_identifier(self, request: Request) -> str:
        """Extract client IP, preferring X-Forwarded-For if behind a proxy like Cloud Run."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        client = request.client
        return client.host if client else "unknown_client"

    def __call__(self, request: Request):
        settings = get_settings()
        if not settings.rate_limit_enabled:
            return True

        client_id = self._get_client_identifier(request)
        now = time.time()
        window_start = now - self.window_seconds

        with self._lock:
            timestamps = self._requests.setdefault(client_id, [])
            # Evict timestamps older than the window
            self._requests[client_id] = [t for t in timestamps if t > window_start]
            current_count = len(self._requests[client_id])

            if current_count >= self.limit:
                retry_after = int(self.window_seconds - (now - self._requests[client_id][0]))
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded ({self.limit} requests per {self.window_seconds}s). Please retry after {max(1, retry_after)} seconds.",
                    headers={"Retry-After": str(max(1, retry_after))},
                )

            self._requests[client_id].append(now)

        return True


# Pre-configured rate limiter instances for different route sensitivities
rate_limit_standard = SlidingWindowRateLimiter(limit=30, window_seconds=60)
rate_limit_expensive = SlidingWindowRateLimiter(limit=10, window_seconds=60)
rate_limit_scout = SlidingWindowRateLimiter(limit=5, window_seconds=60)
