# ── Stage 1: Build Frontend SPA ───────────────────────
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
# Build production assets (Vite bundle in dist/)
RUN npm run build

# ── Stage 2: Production Python Backend ──────────────
FROM python:3.11-slim

WORKDIR /app

# Install system utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend application code
COPY backend/app ./app

# Copy compiled frontend SPA from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Environment variables
ENV PYTHONPATH=/app
ENV PORT=8080
ENV STUDIOSCOUT_DB_PATH=/app/data/studioscout.db

# Ensure persistent data directory exists
RUN mkdir -p /app/data /app/uploads

EXPOSE 8080

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
