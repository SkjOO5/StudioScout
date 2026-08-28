#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# StudioScout AI — Google Cloud Setup Script
#
# Enables required APIs, creates dedicated service account with least privilege,
# and initializes Secret Manager for runtime Parallel Search credentials.
#
# Usage:
#   export GCP_PROJECT_ID="your-project-id"
#   export GCP_REGION="asia-south1" # or us-central1
#   ./scripts/setup-gcp.sh
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || true)}"
REGION="${GCP_REGION:-asia-south1}"
SA_NAME="studioscout-sa"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

if [[ -z "${PROJECT_ID}" ]]; then
  echo "❌ Error: GCP_PROJECT_ID is not set. Run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
fi

echo "============================================================"
echo "🎬 StudioScout AI — GCP Infrastructure Provisioning"
echo "Project ID : ${PROJECT_ID}"
echo "Region     : ${REGION}"
echo "Service Acc: ${SA_EMAIL}"
echo "============================================================"

# 1. Enable ONLY required Google Cloud APIs
echo "➡️  [1/4] Enabling required Google Cloud APIs..."
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  aiplatform.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  --project="${PROJECT_ID}"

# 2. Create dedicated Service Account for StudioScout runtime
echo "➡️  [2/4] Configuring dedicated Service Account: ${SA_NAME}..."
if ! gcloud iam service-accounts describe "${SA_EMAIL}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud iam service-accounts create "${SA_NAME}" \
    --display-name="StudioScout AI Runtime Identity" \
    --description="Least-privilege runtime identity for StudioScout AI Cloud Run service" \
    --project="${PROJECT_ID}"
  echo "✅ Service account created: ${SA_EMAIL}"
else
  echo "ℹ️  Service account ${SA_EMAIL} already exists."
fi

# 3. Grant Least-Privilege IAM Roles
echo "➡️  [3/4] Granting Least-Privilege IAM Roles..."
ROLES=(
  "roles/aiplatform.user"               # Vertex AI Gemini model invocation via ADC
  "roles/secretmanager.secretAccessor"  # Access Parallel Search key from Secret Manager
  "roles/logging.logWriter"             # Application structured runtime logging
)

for role in "${ROLES[@]}"; do
  echo "  - Granting ${role} to ${SA_EMAIL}..."
  gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="${role}" \
    --condition=None \
    --quiet >/dev/null
done

# Grant Cloud Build / Compute default account permissions to read build sources
PROJECT_NUM=$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')
COMPUTE_SA="${PROJECT_NUM}-compute@developer.gserviceaccount.com"
echo "➡️  Granting Storage permissions to default compute service account (${COMPUTE_SA})..."
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${COMPUTE_SA}" \
  --role="roles/storage.admin" \
  --condition=None \
  --quiet >/dev/null

# 4. Initialize Secret Manager for Parallel API Key
echo "➡️  [4/4] Setting up Secret Manager for PARALLEL_API_KEY..."
SECRET_NAME="parallel-api-key"

if ! gcloud secrets describe "${SECRET_NAME}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
  gcloud secrets create "${SECRET_NAME}" \
    --replication-policy="automatic" \
    --project="${PROJECT_ID}"
  echo "✅ Secret '${SECRET_NAME}' created."
  echo ""
  echo "⚠️  ACTION REQUIRED: Add your Parallel API key to Secret Manager by running:"
  echo "   printf '%s' 'YOUR_PARALLEL_API_KEY' | gcloud secrets versions add ${SECRET_NAME} --data-file=- --project=${PROJECT_ID}"
else
  echo "ℹ️  Secret '${SECRET_NAME}' already exists in Secret Manager."
fi

echo ""
echo "============================================================"
echo "✅ GCP Setup Complete!"
echo "Next step: Run ./scripts/deploy-cloudrun.sh to deploy StudioScout AI."
echo "============================================================"
