# StudioScout AI — Security & Privacy Architecture

## 1. Credential & Secret Management
- **Zero API Keys in Frontend:** Neither `GOOGLE_API_KEY` nor `PARALLEL_API_KEY` are bundled into frontend assets or exposed in client responses.
- **Environment-Variable Driven:** All credentials are read at runtime by the backend through `pydantic-settings` from system environment variables or local `.env` files.
- **Safe Health & Status Endpoints:** `/api/health` and `/api/status` return boolean flags indicating whether services are configured without exposing secret values or tokens.

## 2. Partner API Security
- **Backend-Only Invocation:** All Parallel Search API calls are strictly routed through backend tool abstractions (`app/tools/parallel_search.py`).
- **Input Sanitization:** Screenplay queries dispatched to Parallel are sanitized to prevent prompt injection or malformed URI queries.
- **Rate-Limiting & Error Isolation:** API timeouts, rate-limits, and upstream errors are caught gracefully, ensuring the agent returns clear status messages instead of crashing or leaking raw stack traces.

## 3. Upload & File Handling Security
- **Strict MIME & Extension Checks:** File uploads accept only `.pdf` files.
- **File Size Caps:** Upload size is limited to 20MB (`MAX_UPLOAD_SIZE_MB`) to prevent denial-of-service or memory exhaustion.
- **In-Memory Streaming:** Text extraction from PDF documents utilizes byte-stream buffers via `pdfplumber` without storing persistent unencrypted files in insecure directories.

## 4. CORS & Network Security
- **Restricted Origins:** CORS middleware strictly enforces allowed frontend origins configured via `CORS_ORIGINS`.
- **Structured Logging:** Loggers strip any sensitive parameters and record only high-level run IDs, step indices, and error summaries.
