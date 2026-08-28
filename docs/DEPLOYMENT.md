# StudioScout AI — Master Production Deployment Guide

StudioScout AI is deployed to **Google Cloud Run** as a hardened, unified full-stack container (React 19 + Three.js SPA bundled and served by FastAPI). It utilizes **Google Vertex AI** via Application Default Credentials (ADC) for Gemini reasoning and **Google Secret Manager** for runtime Parallel Search web scouting.

---

## 🏗️ Production Architecture

```
                                USER (Browser)
                                      │
                                      ▼ HTTPS
                    ┌───────────────────────────────────┐
                    │      Google Cloud Run Service     │
                    │         "studioscout-ai"          │
                    │                                   │
                    │  ┌─────────────────────────────┐  │
                    │  │  React 19 + Three.js SPA    │  │
                    │  │   (Dark/Light Theme UI)     │  │
                    │  └──────────────┬──────────────┘  │
                    │                 │ Same-Origin     │
                    │                 ▼ /api/*          │
                    │  ┌─────────────────────────────┐  │
                    │  │ FastAPI Async Backend       │  │
                    │  │  - Non-root user (appuser)  │  │
                    │  │  - In-Memory Rate Limiter   │  │
                    │  │  - Ephemeral Demo SQLite    │  │
                    │  └──────────────┬──────────────┘  │
                    └─────────────────┼─────────────────┘
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│     Google Vertex AI / Gemini │             │      Parallel Search API      │
│  - Identity: studioscout-sa   │             │  - Key from Secret Manager    │
│  - Auth: Zero-Key ADC         │             │  - Server-Side Runtime Calls  │
│  - Model: gemini-3.1-flash    │             │  - Live Web Scout Citations   │
└───────────────────────────────┘             └───────────────────────────────┘
```

---

## 🔑 Environment Variables & Secrets Reference

| Variable | Source | Required? | Description |
|---|---|---|---|
| `GOOGLE_GENAI_USE_VERTEXAI` | Environment Variable | **Yes (Cloud)** | Set to `true` to use Vertex AI with Service Account ADC. |
| `GOOGLE_CLOUD_PROJECT` | Environment Variable | **Yes (Cloud)** | Your GCP Project ID. |
| `GOOGLE_CLOUD_LOCATION` | Environment Variable | **Yes (Cloud)** | GCP Region (e.g. `asia-south1` or `us-central1`). |
| `GEMINI_MODEL` | Environment Variable | No | Default: `gemini-3.1-flash` (supports `gemini-2.5-flash`). |
| `PARALLEL_API_KEY` | Google Secret Manager | **Yes** | Parallel Search API key injected at container startup. |
| `MAX_AGENT_STEPS` | Environment Variable | No | Maximum agent execution steps (default: `25`). |
| `MAX_SEARCHES_PER_RUN` | Environment Variable | No | Maximum Parallel searches per scout run (default: `10`). |
| `MAX_RUN_TIME_SECONDS` | Environment Variable | No | Agent run timeout (default: `300`). |
| `RATE_LIMIT_ENABLED` | Environment Variable | No | Enable in-memory per-instance rate limiter (default: `true`). |
| `APP_ENV` | Environment Variable | No | `production` or `development`. |

> [!IMPORTANT]
> Never put actual API keys in source code, Dockerfiles, or git commits. All private credentials must be injected via Secret Manager or environment variables.

---

## 🚀 Step-by-Step Deployment to Google Cloud Run

### Step 1: Prerequisites
Ensure you have the Google Cloud CLI installed and authenticated:
```bash
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID
```

### Step 2: Automated GCP Infrastructure Setup
Run the automated GCP setup script (available in Bash and PowerShell):

```bash
# Linux / macOS / Cloud Shell
export GCP_PROJECT_ID="your-gcp-project-id"
export GCP_REGION="asia-south1"
./scripts/setup-gcp.sh

# Windows PowerShell
$env:GCP_PROJECT_ID = "your-gcp-project-id"
$env:GCP_REGION = "asia-south1"
.\scripts\setup-gcp.ps1
```

This script automatically:
1. Enables required APIs (`run.googleapis.com`, `secretmanager.googleapis.com`, `aiplatform.googleapis.com`, `artifactregistry.googleapis.com`, `cloudbuild.googleapis.com`).
2. Creates the dedicated service account `studioscout-sa@PROJECT_ID.iam.gserviceaccount.com`.
3. Grants Least-Privilege IAM roles:
   - `roles/aiplatform.user` (Vertex AI Gemini access via ADC)
   - `roles/secretmanager.secretAccessor` (Secret Manager read access)
   - `roles/logging.logWriter` (Runtime structured logging)
4. Initializes the Secret Manager secret `parallel-api-key`.

### Step 3: Add Parallel API Key to Secret Manager
Add your real Parallel API key securely into Secret Manager:

```bash
# Linux / macOS / Cloud Shell
printf '%s' 'YOUR_ACTUAL_PARALLEL_API_KEY' | gcloud secrets versions add parallel-api-key --data-file=- --project=YOUR_GCP_PROJECT_ID

# Windows PowerShell
Set-Content -NoNewline 'YOUR_ACTUAL_PARALLEL_API_KEY' | gcloud secrets versions add parallel-api-key --data-file=- --project=YOUR_GCP_PROJECT_ID
```

---

### Step 4: Build & Deploy to Cloud Run

Run the automated Cloud Run deployment script:

```bash
# Linux / macOS / Cloud Shell
./scripts/deploy-cloudrun.sh

# Windows PowerShell
.\scripts\deploy-cloudrun.ps1
```

Or deploy directly via `gcloud`:
```bash
gcloud run deploy studioscout-ai \
  --source . \
  --platform managed \
  --region asia-south1 \
  --service-account studioscout-sa@YOUR_GCP_PROJECT_ID.iam.gserviceaccount.com \
  --allow-unauthenticated \
  --port 8080 \
  --min-instances 0 \
  --max-instances 2 \
  --concurrency 80 \
  --timeout 300 \
  --cpu 1 \
  --memory 1Gi \
  --set-env-vars "GOOGLE_GENAI_USE_VERTEXAI=true,GOOGLE_CLOUD_PROJECT=YOUR_GCP_PROJECT_ID,GOOGLE_CLOUD_LOCATION=asia-south1,GEMINI_MODEL=gemini-3.1-flash,APP_ENV=production" \
  --set-secrets "PARALLEL_API_KEY=parallel-api-key:latest" \
  --no-traffic \
  --tag candidate
```

---

### Step 5: Smoke Testing & Traffic Promotion

Run the automated verification script to smoke test the candidate revision and route 100% of production traffic:

```bash
# Linux / macOS / Cloud Shell
./scripts/verify-production.sh

# Windows PowerShell
.\scripts\verify-production.ps1
```

The script verifies:
1. `GET /health` → HTTP 200 `{"status": "ok"}`
2. `GET /api/health` → Verification of Gemini and Parallel status
3. `GET /api/status` → Verification of model and search provider metadata
4. `GET /api/projects` → Verification of pre-seeded *Cipher Zero* showcase project
5. Promotes the candidate revision to 100% traffic upon success.

---

## ⏪ Rollback Strategy

If an unexpected issue occurs with the newest deployment, roll back immediately to a previous known-good revision:

```bash
# 1. List available revisions
gcloud run revisions list --service=studioscout-ai --region=asia-south1 --project=YOUR_GCP_PROJECT_ID

# 2. Route 100% traffic back to previous revision
gcloud run services update-traffic studioscout-ai \
  --to-revisions=studioscout-ai-00001-abc=100 \
  --region=asia-south1 \
  --project=YOUR_GCP_PROJECT_ID
```

---

## 💰 Cost Controls & Resource Limits

To protect against unexpected charges during hackathons and public demonstrations:

| Control | Setting | Purpose |
|---|---|---|
| **Max Instances** | `--max-instances 2` | Caps concurrent container instances. |
| **Scale to Zero** | `--min-instances 0` | Scales down to $0 compute cost when idle. |
| **Concurrency** | `--concurrency 80` | Handles multiple concurrent users per instance. |
| **Timeout** | `--timeout 300` | Prevents hanging background requests from consuming compute. |
| **Agent Step Limit** | `MAX_AGENT_STEPS=25` | Prevents infinite multi-step loops. |
| **Search Limit** | `MAX_SEARCHES_PER_RUN=10` | Limits Parallel Search API calls per run. |
| **Rate Limiting** | 10-15 req/min per IP | Prevents endpoint spamming on expensive AI routes. |

---

## 🔍 Viewing Production Logs

To view structured production logs in real time:
```bash
gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=studioscout-ai' \
  --limit=50 \
  --project=YOUR_GCP_PROJECT_ID
```

Or view directly in the [Google Cloud Console Logs Viewer](https://console.cloud.google.com/logs).
