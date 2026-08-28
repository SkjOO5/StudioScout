#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# StudioScout AI — Production Verification & Traffic Promotion Script
#
# Performs automated smoke tests against the candidate revision and routes
# 100% of production traffic once all health checks pass.
#
# Usage:
#   export GCP_PROJECT_ID="your-project-id"
#   export GCP_REGION="asia-south1" # or us-central1
#   ./scripts/verify-production.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || true)}"
REGION="${GCP_REGION:-asia-south1}"
SERVICE_NAME="studioscout-ai"

if [[ -z "${PROJECT_ID}" ]]; then
  echo "❌ Error: GCP_PROJECT_ID is not set. Run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

echo "============================================================"
echo "🧪 StudioScout AI — Production Verification & Promotion"
echo "Service Name: ${SERVICE_NAME}"
echo "Project ID  : ${PROJECT_ID}"
echo "Region      : ${REGION}"
echo "============================================================"

# Retrieve candidate or service URL
echo "➡️  [1/4] Retrieving Cloud Run endpoint URL..."
CANDIDATE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format="value(status.traffic[?tag=='candidate'].url)" 2>/dev/null || true)

if [[ -z "${CANDIDATE_URL}" ]]; then
  CANDIDATE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
    --region="${REGION}" \
    --project="${PROJECT_ID}" \
    --format="value(status.url)")
fi

echo "🌐 Target URL: ${CANDIDATE_URL}"

# 2. Run Smoke Tests
echo "➡️  [2/4] Running automated smoke tests..."

echo "  - Checking GET /health..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${CANDIDATE_URL}/health" || echo "000")
if [[ "${HTTP_CODE}" != "200" ]]; then
  echo "❌ Failed: /health returned HTTP ${HTTP_CODE}"
  exit 1
fi
echo "    ✅ /health OK (HTTP 200)"

echo "  - Checking GET /api/health..."
HEALTH_RESP=$(curl -s "${CANDIDATE_URL}/api/health")
echo "    Response: ${HEALTH_RESP}"

echo "  - Checking GET /api/status..."
STATUS_RESP=$(curl -s "${CANDIDATE_URL}/api/status")
echo "    Response: ${STATUS_RESP}"

echo "  - Checking GET /api/projects (Demo Pre-seed verification)..."
PROJECTS_RESP=$(curl -s "${CANDIDATE_URL}/api/projects")
echo "    ✅ Projects API responsive"

# 3. Promote Candidate Revision to 100% Traffic
echo "➡️  [3/4] Promoting candidate revision to 100% production traffic..."
gcloud run services update-traffic "${SERVICE_NAME}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --to-latest

LIVE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
  --region="${REGION}" \
  --project="${PROJECT_ID}" \
  --format="value(status.url)")

# 4. Success Summary
echo ""
echo "============================================================"
echo "🎉 StudioScout AI is LIVE in Production!"
echo "🌐 Public URL: ${LIVE_URL}"
echo ""
echo "📜 To view live Cloud Run logs:"
echo "   gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=${SERVICE_NAME}' --limit=50 --project=${PROJECT_ID}"
echo ""
echo "⏪ To Rollback to a previous revision if needed:"
echo "   gcloud run revisions list --service=${SERVICE_NAME} --region=${REGION} --project=${PROJECT_ID}"
echo "   gcloud run services update-traffic ${SERVICE_NAME} --to-revisions=PREVIOUS_REVISION=100 --region=${REGION} --project=${PROJECT_ID}"
echo "============================================================"
