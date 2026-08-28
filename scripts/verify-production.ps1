# ─────────────────────────────────────────────────────────────────────────────
# StudioScout AI — Production Verification & Traffic Promotion Script (PowerShell)
#
# Performs automated smoke tests against the candidate revision and routes
# 100% of production traffic once all health checks pass.
#
# Usage:
#   $env:GCP_PROJECT_ID = "your-project-id"
#   $env:GCP_REGION = "asia-south1" # or us-central1
#   .\scripts\verify-production.ps1
# ─────────────────────────────────────────────────────────────────────────────
$ErrorActionPreference = "Stop"

$ProjectId = if ($env:GCP_PROJECT_ID) { $env:GCP_PROJECT_ID } else { (gcloud config get-value project 2>$null) }
$Region = if ($env:GCP_REGION) { $env:GCP_REGION } else { "asia-south1" }
$ServiceName = "studioscout-ai"

if (-not $ProjectId) {
    Write-Error "❌ Error: GCP_PROJECT_ID is not set. Run: gcloud config set project YOUR_PROJECT_ID"
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🧪 StudioScout AI — Production Verification & Promotion" -ForegroundColor Cyan
Write-Host "Service Name: $ServiceName"
Write-Host "Project ID  : $ProjectId"
Write-Host "Region      : $Region"
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Retrieve Candidate URL
Write-Host "➡️  [1/4] Retrieving Cloud Run endpoint URL..." -ForegroundColor Yellow
$CandidateUrl = gcloud run services describe $ServiceName `
  --region=$Region `
  --project=$ProjectId `
  --format="value(status.traffic[?tag=='candidate'].url)" 2>$null

if (-not $CandidateUrl) {
    $CandidateUrl = gcloud run services describe $ServiceName `
      --region=$Region `
      --project=$ProjectId `
      --format="value(status.url)"
}

Write-Host "🌐 Target URL: $CandidateUrl" -ForegroundColor White

# 2. Run Smoke Tests
Write-Host "➡️  [2/4] Running automated smoke tests..." -ForegroundColor Yellow

try {
    $healthResp = Invoke-RestMethod -Uri "$CandidateUrl/health" -Method Get -TimeoutSec 15
    Write-Host "    ✅ /health OK: status = $($healthResp.status)" -ForegroundColor Green
} catch {
    Write-Error "❌ /health check failed: $_"
}

try {
    $statusResp = Invoke-RestMethod -Uri "$CandidateUrl/api/status" -Method Get -TimeoutSec 15
    Write-Host "    ✅ /api/status OK: Gemini = $($statusResp.ai.model), Parallel = $($statusResp.search.provider)" -ForegroundColor Green
} catch {
    Write-Warning "⚠️ /api/status warning: $_"
}

try {
    $projectsResp = Invoke-RestMethod -Uri "$CandidateUrl/api/projects" -Method Get -TimeoutSec 15
    Write-Host "    ✅ /api/projects OK: $($projectsResp.Count) projects loaded" -ForegroundColor Green
} catch {
    Write-Warning "⚠️ /api/projects warning: $_"
}

# 3. Promote Candidate Revision to 100% Traffic
Write-Host "➡️  [3/4] Promoting candidate revision to 100% production traffic..." -ForegroundColor Yellow
gcloud run services update-traffic $ServiceName `
  --region=$Region `
  --project=$ProjectId `
  --to-latest

$LiveUrl = gcloud run services describe $ServiceName `
  --region=$Region `
  --project=$ProjectId `
  --format="value(status.url)"

# 4. Success Summary
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🎉 StudioScout AI is LIVE in Production!" -ForegroundColor Green
Write-Host "🌐 Public URL: $LiveUrl" -ForegroundColor White
Write-Host ""
Write-Host "📜 To view live Cloud Run logs:" -ForegroundColor Yellow
Write-Host "   gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=$ServiceName' --limit=50 --project=$ProjectId" -ForegroundColor White
Write-Host ""
Write-Host "⏪ To Rollback to a previous revision if needed:" -ForegroundColor Yellow
Write-Host "   gcloud run revisions list --service=$ServiceName --region=$Region --project=$ProjectId" -ForegroundColor White
Write-Host "   gcloud run services update-traffic $ServiceName --to-revisions=PREVIOUS_REVISION=100 --region=$Region --project=$ProjectId" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
