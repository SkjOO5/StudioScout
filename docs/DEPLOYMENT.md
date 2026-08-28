# StudioScout AI — Production Deployment Guide

StudioScout AI can be deployed either as a **unified full-stack container** (recommended for Cloud Run, Render, Railway) or as **split frontend and backend services** (Vercel + Cloud Run).

---

## 🔑 Required Environment Variables

Before deploying, ensure you have your API keys ready:

| Variable | Description | Required? | Example / Default |
|---|---|---|---|
| `GOOGLE_API_KEY` | Google Gemini API Key for Scene Parsing, 6-Dimension Rubric Scoring & Call Sheet Generation | **Yes** | `AIzaSy...` |
| `PARALLEL_API_KEY` | Parallel Search API Key for Live Web Location Discovery & Citation Grounding | **Yes** | `parallel_...` |
| `GEMINI_MODEL` | Gemini Model identifier | No | `gemini-3.1-flash` (or `gemini-2.5-flash`) |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) | No | `*` or `https://studioscout.vercel.app` |
| `STUDIOSCOUT_DB_PATH` | Persistent SQLite database path | No | `/app/data/studioscout.db` |
| `VITE_API_URL` | Frontend API Base URL (if deploying frontend separately) | For Split Deploy | `https://your-backend.run.app/api` |

---

## Option 1: Google Cloud Run (Recommended for Google Cloud & Hackathons)

Google Cloud Run is serverless, scales to zero when idle (cost-effective), and provides automated HTTPS.

### Step 1: Install & Authenticate Google Cloud CLI
```bash
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID
```

### Step 2: Build & Deploy Unified Container
Run this single command from the project root:

```bash
gcloud run deploy studioscout-ai \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "GOOGLE_API_KEY=YOUR_KEY,PARALLEL_API_KEY=YOUR_KEY,GEMINI_MODEL=gemini-3.1-flash,CORS_ORIGINS=*"
```

Cloud Run will build the multi-stage Dockerfile (compiling the React frontend and bundling it with the FastAPI backend) and give you a live production URL:
```
Service URL: https://studioscout-ai-xyz-uc.a.run.app
```

---

## Option 2: Render / Railway (1-Click Docker Web Service)

### Deploy on Render:
1. Push your repository to **GitHub**.
2. Go to [Render Dashboard](https://dashboard.render.com/) -> **New +** -> **Web Service**.
3. Connect your repository.
4. Set:
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Docker Context**: `.`
5. Add Environment Variables:
   - `GOOGLE_API_KEY` = `your-gemini-key`
   - `PARALLEL_API_KEY` = `your-parallel-key`
   - `GEMINI_MODEL` = `gemini-3.1-flash`
   - `CORS_ORIGINS` = `*`
6. Click **Deploy Web Service**.

### Deploy on Railway:
1. Go to [Railway.app](https://railway.app/) -> **New Project** -> **Deploy from GitHub repo**.
2. Select your repository.
3. Under **Variables**, add `GOOGLE_API_KEY` and `PARALLEL_API_KEY`.
4. Railway will automatically detect the root `Dockerfile`, build both the frontend and backend, and provide a public `.up.railway.app` URL.

---

## Option 3: Split Deployment (Vercel Frontend + Cloud Run / Render Backend)

### Step 1: Deploy Backend to Cloud Run or Render
Follow Option 1 or 2 to deploy just the backend. Note down your backend URL (e.g. `https://api.studioscout.example.com`).

### Step 2: Deploy Frontend to Vercel
1. Go to [Vercel](https://vercel.com/) -> **Add New Project**.
2. Select your GitHub repository.
3. In **Root Directory**, choose `frontend`.
4. In **Build & Output Settings**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. In **Environment Variables**:
   - Add `VITE_API_URL` = `https://your-backend-url/api`
6. Click **Deploy**.

---

## Option 4: Local Docker Compose

To test the production container locally:

```bash
# Provide keys in your environment or a .env file
docker-compose up --build
```
Access the application at `http://localhost:5173` (or `http://localhost:8000`).
