# ─────────────────────────────────────────────────────────────────────────────
# StudioScout AI — Google Cloud Setup Script (PowerShell for Windows)
#
# Enables required APIs, creates dedicated service account with least privilege,
# and initializes Secret Manager for runtime Parallel Search credentials.
#
# Usage:
#   $env:GCP_PROJECT_ID = "your-project-id"
#   $env:GCP_REGION = "asia-south1" # or us-central1
#   .\scripts\setup-gcp.ps1
# ─────────────────────────────────────────────────────────────────────────────
$ErrorActionPreference = "Stop"

$ProjectId = if ($env:GCP_PROJECT_ID) { $env:GCP_PROJECT_ID } else { (gcloud config get-value project 2>$null) }
$Region = if ($env:GCP_REGION) { $env:GCP_REGION } else { "asia-south1" }
$SaName = "studioscout-sa"
$SaEmail = "$SaName@$ProjectId.iam.gserviceaccount.com"

if (-not $ProjectId) {
    Write-Error "❌ Error: GCP_PROJECT_ID is not set. Run: gcloud config set project YOUR_PROJECT_ID"
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🎬 StudioScout AI — GCP Infrastructure Provisioning" -ForegroundColor Cyan
Write-Host "Project ID : $ProjectId"
Write-Host "Region     : $Region"
Write-Host "Service Acc: $SaEmail"
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Enable ONLY required Google Cloud APIs
Write-Host "➡️  [1/4] Enabling required Google Cloud APIs..." -ForegroundColor Yellow
gcloud services enable `
  run.googleapis.com `
  secretmanager.googleapis.com `
  aiplatform.googleapis.com `
  artifactregistry.googleapis.com `
  cloudbuild.googleapis.com `
  --project=$ProjectId

# 2. Create dedicated Service Account for StudioScout runtime
Write-Host "➡️  [2/4] Configuring dedicated Service Account: $SaName..." -ForegroundColor Yellow
$saExists = gcloud iam service-accounts describe $SaEmail --project=$ProjectId 2>$null
if (-not $saExists) {
    gcloud iam service-accounts create $SaName `
      --display-name="StudioScout AI Runtime Identity" `
      --description="Least-privilege runtime identity for StudioScout AI Cloud Run service" `
      --project=$ProjectId
    Write-Host "✅ Service account created: $SaEmail" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Service account $SaEmail already exists."
}

# 3. Grant Least-Privilege IAM Roles
Write-Host "➡️  [3/4] Granting Least-Privilege IAM Roles..." -ForegroundColor Yellow
$Roles = @(
  "roles/aiplatform.user",              # Vertex AI Gemini model invocation via ADC
  "roles/secretmanager.secretAccessor", # Access Parallel Search key from Secret Manager
  "roles/logging.logWriter"             # Application structured runtime logging
)

foreach ($role in $Roles) {
    Write-Host "  - Granting $role..."
    gcloud projects add-iam-policy-binding $ProjectId `
      --member="serviceAccount:$SaEmail" `
      --role=$role `
      --condition=None `
      --quiet | Out-Null
}

# 4. Initialize Secret Manager for Parallel API Key
Write-Host "➡️  [4/4] Setting up Secret Manager for PARALLEL_API_KEY..." -ForegroundColor Yellow
$SecretName = "parallel-api-key"
$secretExists = gcloud secrets describe $SecretName --project=$ProjectId 2>$null

if (-not $secretExists) {
    gcloud secrets create $SecretName `
      --replication-policy="automatic" `
      --project=$ProjectId
    Write-Host "✅ Secret '$SecretName' created." -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  ACTION REQUIRED: Add your Parallel API key to Secret Manager by running:" -ForegroundColor Yellow
    Write-Host "   Set-Content -NoNewline 'YOUR_PARALLEL_API_KEY' | gcloud secrets versions add $SecretName --data-file=- --project=$ProjectId" -ForegroundColor White
} else {
    Write-Host "ℹ️  Secret '$SecretName' already exists in Secret Manager."
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "✅ GCP Setup Complete!" -ForegroundColor Green
Write-Host "Next step: Run .\scripts\deploy-cloudrun.ps1 to deploy StudioScout AI."
Write-Host "============================================================" -ForegroundColor Cyan
