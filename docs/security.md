# StudioScout AI — Security & Governance Architecture

StudioScout AI is engineered with an industrial defense-in-depth posture tailored for enterprise cloud deployment and hackathon demonstrations.

---

## 1. Identity & Zero-Key Cloud Authentication
- **Vertex AI Application Default Credentials (ADC)**: When running on Google Cloud Run, StudioScout uses the attached service account identity (`studioscout-sa@PROJECT_ID.iam.gserviceaccount.com`) to authenticate directly with Vertex AI Gemini models. No static `GOOGLE_API_KEY` is needed or stored in production.
- **Least-Privilege IAM**: The runtime service account is assigned only the minimum roles required:
  - `roles/aiplatform.user` (Invoke Vertex AI models)
  - `roles/secretmanager.secretAccessor` (Read runtime secrets)
  - `roles/logging.logWriter` (Structured cloud logging)

---

## 2. Secret Manager & Partner Key Isolation
- **Secret Manager Injection**: The `PARALLEL_API_KEY` is stored in Google Secret Manager and mounted at container startup via Cloud Run secret binding.
- **Zero Frontend Secret Exposure**: No private API keys or service account credentials ever touch the React/Three.js frontend bundle, localStorage, cookies, or HTTP headers.
- **Sanitized Status Endpoints**: `/health`, `/api/health`, and `/api/status` expose only non-sensitive boolean flags (`gemini_configured: true`, `parallel_configured: true`) and model identifiers, never raw keys or connection strings.

---

## 3. Container Hardening & Non-Root Runtime
- **Non-Root User (`appuser`)**: The production Docker container executes as an unprivileged user (UID `10001`, `appuser`), preventing container escape risks.
- **Multi-Stage Build**: Development dependencies, source TypeScript files, and compilers are discarded after Stage 1. The final runtime container image contains only the compiled static SPA and Python runtime.
- **Ephemeral Storage**: Container runtime data (`/app/data`, `/tmp/studioscout_uploads`) resides in restricted directories with explicit ownership.

---

## 4. Rate Limiting, Safety Bounds & Cost Protection
- **Sliding-Window Rate Limiter**: Expensive AI endpoints (`/api/projects`, `/api/projects/{id}/scout`, `/api/projects/{id}/replan`, `/api/storyboards`, `/api/audio`, `/api/tableread`) are protected by per-instance rate limiters (5–15 req/min per IP).
- **Agent Step & Search Caps**:
  - `MAX_AGENT_STEPS = 25`: Caps maximum agent execution steps per session.
  - `MAX_SEARCHES_PER_RUN = 10`: Binds total Parallel Search queries to prevent runaway API consumption.
  - `MAX_RUN_TIME_SECONDS = 300`: Enforces hard timeouts on background scout workflows.
- **Cloud Run Scaling Bounds**: Hard limit of `--max-instances 2` and `--concurrency 80` prevents auto-scaling cost spikes during public traffic bursts.

---

## 5. File Upload & Input Defense
- **MIME & Extension Enforcement**: Uploads accept strictly `.pdf` documents with magic-byte checks.
- **Upload Size Cap**: Hard ceiling of 20MB (`MAX_UPLOAD_SIZE_MB`) prevents memory exhaustion.
- **In-Memory Parsing**: PDFs are processed in-memory via `pdfplumber` byte streams without retaining permanent unencrypted screenplay files on disk.

---

## 6. Safe Structured Logging
- **Credential Scrubbing**: Application loggers record high-level execution context (Run ID, Scene ID, Step status, Duration ms) while stripping sensitive headers, auth tokens, and full screenplay payloads.
