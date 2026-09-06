#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# StudioScout AI — Cloud Run Deployment Script
#
# Builds the unified container (React SPA + FastAPI) and deploys to Cloud Run
# with Vertex AI ADC authentication, Secret Manager binding, and cost bounds.
#
# Usage:
#   export GCP_PROJECT_ID="your-project-id"
#   export GCP_REGION="asia-south1" # or us-central1
#   ./scripts/deploy-cloudrun.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || true)}"
REGION="${GCP_REGION:-asia-south1}"
SERVICE_NAME="studioscout-ai"
SA_EMAIL="studioscout-sa@${PROJECT_ID}.iam.gserviceaccount.com"

if [[ -z "${PROJECT_ID}" ]]; then
  echo "❌ Error: GCP_PROJECT_ID is not set. Run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

echo "============================================================"
echo "🚀 StudioScout AI — Deploying to Google Cloud Run"
echo "Service Name: ${SERVICE_NAME}"
echo "Project ID  : ${PROJECT_ID}"
echo "Region      : ${REGION}"
echo "Identity    : ${SA_EMAIL}"
echo "============================================================"

# Check if service already exists
SERVICE_EXISTS=$(gcloud run services describe "${SERVICE_NAME}" --region="${REGION}" --project="${PROJECT_ID}" >/dev/null 2>&1 && echo "yes" || echo "no")

EXTRA_FLAGS=()
if [[ "${SERVICE_EXISTS}" == "yes" ]]; then
  EXTRA_FLAGS+=(--no-traffic --tag candidate)
fi

IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/cloud-run-source-deploy/${SERVICE_NAME}:latest"

if command -v docker &>/dev/null; then
  echo "➡️  [1/3] Ensuring Artifact Registry repository exists..."
  gcloud artifacts repositories create cloud-run-source-deploy \
    --repository-format=docker \
    --location="${REGION}" \
    --project="${PROJECT_ID}" \
    --description="Cloud Run source deploy repository" 2>/dev/null || true

  echo "➡️  [2/3] Configuring Docker authentication..."
  gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

  echo "➡️  [3/3] Building container image locally with Docker..."
  docker build -t "${IMAGE_URI}" .

  echo "➡️  Pushing container image to Artifact Registry..."
  docker push "${IMAGE_URI}"

  echo "➡️  Deploying pre-built container to Cloud Run..."
  gcloud run deploy "${SERVICE_NAME}" \
    --image "${IMAGE_URI}" \
    --platform managed \
    --region "${REGION}" \
    --service-account "${SA_EMAIL}" \
    --allow-unauthenticated \
    --port 8080 \
    --min-instances 0 \
    --max-instances 2 \
    --concurrency 80 \
    --timeout 300 \
    --cpu 1 \
    --memory 1Gi \
    --set-env-vars "GOOGLE_GENAI_USE_VERTEXAI=true,GOOGLE_CLOUD_PROJECT=${PROJECT_ID},GOOGLE_CLOUD_LOCATION=${REGION},GEMINI_MODEL=gemini-3.1-flash,APP_ENV=production" \
    --set-secrets "PARALLEL_API_KEY=parallel-api-key:latest" \
    "${EXTRA_FLAGS[@]}" \
    --project "${PROJECT_ID}"
else
  echo "➡️  Building and deploying container to Cloud Run via Cloud Build..."
  gcloud run deploy "${SERVICE_NAME}" \
    --source . \
    --platform managed \
    --region "${REGION}" \
    --service-account "${SA_EMAIL}" \
    --allow-unauthenticated \
    --port 8080 \
    --min-instances 0 \
    --max-instances 2 \
    --concurrency 80 \
    --timeout 300 \
    --cpu 1 \
    --memory 1Gi \
    --set-env-vars "GOOGLE_GENAI_USE_VERTEXAI=true,GOOGLE_CLOUD_PROJECT=${PROJECT_ID},GOOGLE_CLOUD_LOCATION=${REGION},GEMINI_MODEL=gemini-3.1-flash,APP_ENV=production" \
    --set-secrets "PARALLEL_API_KEY=parallel-api-key:latest" \
    "${EXTRA_FLAGS[@]}" \
    --project "${PROJECT_ID}"
fi

echo ""
echo "============================================================"
echo "✅ Candidate Revision Deployed!"
echo ""
echo "To verify and route traffic to the new revision, run:"
echo "   ./scripts/verify-production.sh"
echo "============================================================"
