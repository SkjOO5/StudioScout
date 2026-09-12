# ── Stage 1: Build Frontend SPA ───────────────────────
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ ./
# Build production assets (Vite bundle in dist/)
RUN npm run build

# ── Stage 2: Production Python Backend ──────────────
FROM python:3.11-slim

# Create dedicated non-root user (UID 1000 standard for Hugging Face Spaces)
RUN useradd -m -u 1000 user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

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

# Create runtime directories and set ownership
RUN mkdir -p /app/data /app/uploads /tmp/studioscout_uploads && \
    chown -R user:user /app /tmp/studioscout_uploads /home/user

# Environment variables (Port 7860 is standard for Hugging Face Spaces)
ENV PYTHONPATH=/app
ENV PORT=7860
ENV STUDIOSCOUT_DB_PATH=/app/data/studioscout.db
ENV UPLOAD_DIR=/tmp/studioscout_uploads

# Switch to non-root execution
USER user

EXPOSE 7860

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]

