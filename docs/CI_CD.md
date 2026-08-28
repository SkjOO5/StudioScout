# StudioScout AI — Continuous Integration & Deployment (CI/CD) 🚀

This document outlines the automated CI/CD pipeline powering StudioScout AI on GitHub Actions and Google Cloud Run.

---

## 🏗️ Pipeline Overview

```
[Git Push to main]
       │
       ▼
[Job 1: Test & Quality Gate]
  ├── Node 20 / Vite React Build
  ├── Python 3.11 / Pytest Suite (20+ tests)
  └── Export Engine Validation (PDF, ICS, CSV)
       │
       ▼ (Only on main push after tests pass)
[Job 2: Deploy to Google Cloud Run]
  ├── Authenticate via Workload Identity Federation (WIF / OIDC)
  ├── Build Docker Image & Push to Artifact Registry
  ├── Deploy revision with zero-downtime traffic migration
  └── Automated Smoke Test on /health and /api/status
```

---

## 🔐 Workload Identity Federation (Zero Static Keys)

To eliminate long-lived service account keys (`.json` key files) from GitHub Secrets, the pipeline supports **Workload Identity Federation (WIF)**.

### GCP Setup Commands:

```bash
# 1. Create a Workload Identity Pool
gcloud iam workload-identity-pools create "github-pool" \
  --project="project-4a8809ab-15f6-4bc2-b2e" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# 2. Create a Workload Identity Provider for GitHub OIDC
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --project="project-4a8809ab-15f6-4bc2-b2e" \
  --location="global" \
  --workload-identity-pool="github-pool" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# 3. Allow GitHub repository to impersonate the Service Account
gcloud iam service-accounts add-iam-policy-binding \
  "studioscout-sa@project-4a8809ab-15f6-4bc2-b2e.iam.gserviceaccount.com" \
  --project="project-4a8809ab-15f6-4bc2-b2e" \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/111556269084/locations/global/workloadIdentityPools/github-pool/attribute.repository/SkjOO5/StudioScout"
```

---

## 🔑 GitHub Repository Secrets

Configure the following secrets in GitHub under **Settings > Secrets and variables > Actions**:

| Secret Name | Description | Example Value |
|---|---|---|
| `GCP_PROJECT_ID` | Google Cloud Project ID | `project-4a8809ab-15f6-4bc2-b2e` |
| `GCP_REGION` | Compute region | `asia-south1` |
| `GCP_WIF_PROVIDER` | Full resource name of the WIF provider | `projects/111556269084/locations/global/workloadIdentityPools/github-pool/providers/github-provider` |
| `GCP_WIF_SERVICE_ACCOUNT` | Service Account email | `studioscout-sa@project-4a8809ab-15f6-4bc2-b2e.iam.gserviceaccount.com` |

---

## 🛡️ Safeguards & Best Practices

1. **Deterministic Test Suite**: The test suite runs against local demo data and does not invoke external live AI calls during CI runs.
2. **Secrets Isolation**: `PARALLEL_API_KEY` is never stored in GitHub or Docker images; it is injected at runtime directly from Google Secret Manager.
3. **Rollback**: Cloud Run retains historical revisions. If any deployment issue occurs, traffic can be rolled back instantly with:
   ```bash
   gcloud run services update-traffic studioscout-ai --to-revisions=PREVIOUS_REVISION=100 --region=asia-south1
   ```
