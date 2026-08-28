# StudioScout AI — Backend Troubleshooting & Operations Guide

This guide details diagnostics, common error states, startup procedures, and resolution paths for the StudioScout AI backend service across local development and Cloud Run production environments.

---

## 1. Fast Health & Diagnostic Verification

### Health Endpoint
```bash
# Local
curl -s http://127.0.0.1:8000/health

# Production (Cloud Run)
curl -s https://studioscout-ai-111556269084.asia-south1.run.app/health
```

**Expected Response (`200 OK`):**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "database": "sqlite_local",
  "gemini_configured": true,
  "parallel_configured": true,
  "gemini_model": "gemini-3.1-flash"
}
```

---

## 2. Standard Startup Commands

### Local Development Startup
Always ensure you are in the project's `backend/` root directory:
```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Local Frontend Dev Server
In a separate terminal:
```powershell
cd frontend
npm run dev
```
*(The Vite dev server on port `5173` automatically proxies all `/api` requests to `http://127.0.0.1:8000` via `vite.config.ts`).*

---

## 3. Environment Variables Audit

All backend configuration is managed cleanly through `app.config.Settings` (via Pydantic Settings and `.env`).

| Variable Name | Environment | Required? | Purpose |
|---|---|---|---|
| `GOOGLE_API_KEY` | Dev / Local | Yes (or Vertex AI) | Gemini AI Studio authentication key |
| `GOOGLE_CLOUD_PROJECT` | Production | Yes (on Vertex) | Google Cloud project ID |
| `GOOGLE_GENAI_USE_VERTEXAI` | Production | Optional | Set `true` to route via Vertex AI IAM |
| `GEMINI_MODEL` | All | Optional | Default: `gemini-3.1-flash` (auto-falls back to `gemini-2.5-flash`) |
| `PARALLEL_API_KEY` | All | Yes (for live web search) | Official Parallel Search API key |
| `PARALLEL_PROCESSOR` | All | Optional | `base` or `pro` |
| `CORS_ORIGINS` | All | Optional | Comma-separated allowed origins |
| `RATE_LIMIT_ENABLED` | All | Optional | Default: `true` (controls per-instance sliding window) |

> ⚠️ **Security Notice:** Never commit actual API keys or credential JSON files to version control. Use Secret Manager in Cloud Run.

---

## 4. Known Error States & Resolutions

### Issue A: "Failed to create project. Please check your backend connection."
- **Symptom:** Submitting screenplay text on the Create Project page renders a red connection error banner.
- **Root Causes:**
  1. **Local:** The Python FastAPI backend server is not running on port `8000`.
  2. **Production:** The frontend build had a hardcoded `http://localhost:8000/api` URL instead of relative `/api`.
- **Resolution:**
  - In `frontend/src/lib/api.ts`, ensure `API_BASE = import.meta.env.VITE_API_URL || '/api';`.
  - In `frontend/vite.config.ts`, verify the `/api` proxy target points to `http://127.0.0.1:8000`.
  - Verify backend is running: `curl http://127.0.0.1:8000/health`.

### Issue B: "Rate limit exceeded (10 requests per 60s)" / HTTP 429
- **Symptom:** Rapidly clicking submission buttons or repeated automated calls return `429 Too Many Requests`.
- **Root Cause:** In-memory sliding window rate limiter protects expensive Gemini and Parallel endpoints from accidental runaway loops.
- **Resolution:**
  - Wait for the indicated retry window (typically 10-30 seconds).
  - In local development tests, rate limiting can be toggled via `RATE_LIMIT_ENABLED=false` in `.env`.

### Issue C: Cloud Run Cold Start Timeout
- **Symptom:** Initial `GET /health` or API call takes 8-15 seconds on a scaled-to-zero instance.
- **Root Cause:** Cloud Run scale-to-zero initialization spinning up container runtime and SQLite engine.
- **Resolution:**
  - Normal behavior for `min-instances: 0`. For production low-latency requirements, set `--min-instances 1` in Cloud Run configuration.

---

## 5. Automated Test Matrix

Run the test suite locally at any time:
```powershell
cd backend
python -m pytest tests -v
```

Verification covers:
- Module import integrity
- Project CRUD lifecycle
- Demo Seeding (`Cipher Zero`)
- Parallel Search query execution
- PDF Production Bible generation (Platypus Flowables)
- PDF Call Sheet generation (NumberedCanvas)
- RFC 5545 `.ics` shooting calendar export
- UTF-8 BOM RFC 4180 CSV schedule export
