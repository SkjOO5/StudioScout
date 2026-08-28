# ─────────────────────────────────────────────────────────────────────────────
# StudioScout AI — Cloud Run Deployment Script (PowerShell for Windows)
#
# Builds the unified container (React SPA + FastAPI) and deploys to Cloud Run
# with Vertex AI ADC authentication, Secret Manager binding, and cost bounds.
#
# Usage:
#   $env:GCP_PROJECT_ID = "your-project-id"
#   $env:GCP_REGION = "asia-south1" # or us-central1
#   .\scripts\deploy-cloudrun.ps1
# ─────────────────────────────────────────────────────────────────────────────
$ErrorActionPreference = "Stop"

$ProjectId = if ($env:GCP_PROJECT_ID) { $env:GCP_PROJECT_ID } else { (gcloud config get-value project 2>$null) }
$Region = if ($env:GCP_REGION) { $env:GCP_REGION } else { "asia-south1" }
$ServiceName = "studioscout-ai"
$SaEmail = "studioscout-sa@$ProjectId.iam.gserviceaccount.com"

if (-not $ProjectId) {
    Write-Error "❌ Error: GCP_PROJECT_ID is not set. Run: gcloud config set project YOUR_PROJECT_ID"
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🚀 StudioScout AI — Deploying to Google Cloud Run" -ForegroundColor Cyan
Write-Host "Service Name: $ServiceName"
Write-Host "Project ID  : $ProjectId"
Write-Host "Region      : $Region"
Write-Host "Identity    : $SaEmail"
Write-Host "============================================================" -ForegroundColor Cyan

# Check if service already exists
$ServiceExists = gcloud run services describe $ServiceName --region=$Region --project=$ProjectId 2>$null

$ExtraArgs = @()
if ($ServiceExists) {
    $ExtraArgs += @("--no-traffic", "--tag", "candidate")
}

Write-Host "➡️  Building and deploying container to Cloud Run..." -ForegroundColor Yellow
gcloud run deploy $ServiceName `
  --source . `
  --platform managed `
  --region $Region `
  --service-account $SaEmail `
  --allow-unauthenticated `
  --port 8080 `
  --min-instances 0 `
  --max-instances 2 `
  --concurrency 80 `
  --timeout 300 `
  --cpu 1 `
  --memory 1Gi `
  --set-env-vars "GOOGLE_GENAI_USE_VERTEXAI=true,GOOGLE_CLOUD_PROJECT=$ProjectId,GOOGLE_CLOUD_LOCATION=$Region,GEMINI_MODEL=gemini-3.1-flash,APP_ENV=production" `
  --set-secrets "PARALLEL_API_KEY=parallel-api-key:latest" `
  $ExtraArgs `
  --project $ProjectId

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "✅ Candidate Revision Deployed!" -ForegroundColor Green
Write-Host ""
Write-Host "To verify and route traffic to the new revision, run:" -ForegroundColor Yellow
Write-Host "   .\scripts\verify-production.ps1" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
