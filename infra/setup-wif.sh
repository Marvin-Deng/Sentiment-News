#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID=news-app-500905
REPO="Marvin-Deng/Sentiment-News"
POOL_ID="github-actions"
PROVIDER_ID="github"
SA_NAME="github-actions-account"

# 1. Enable required APIs
gcloud services enable iamcredentials.googleapis.com cloudresourcemanager.googleapis.com \
  --project=$PROJECT_ID

# 2. Create the Workload Identity Pool
gcloud iam workload-identity-pools create $POOL_ID \
  --project=$PROJECT_ID \
  --location="global" \
  --display-name="GitHub Actions" || true

# 3. Create the OIDC provider within the pool
gcloud iam workload-identity-pools providers create-oidc $PROVIDER_ID \
  --project=$PROJECT_ID \
  --location="global" \
  --workload-identity-pool=$POOL_ID \
  --display-name="GitHub" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.actor=assertion.actor" \
  --attribute-condition="assertion.repository=='$REPO'" || true

# 4. Create the service account
gcloud iam service-accounts create $SA_NAME \
  --project=$PROJECT_ID \
  --display-name="GitHub Actions" || true

# 5. Grant permissions to the service account
for ROLE in \
  roles/datastore.owner \
  roles/storage.admin \
  roles/run.admin \
  roles/artifactregistry.admin \
  roles/iam.serviceAccountUser \
  roles/serviceusage.serviceUsageAdmin \
  roles/secretmanager.admin \
  roles/cloudscheduler.admin; do
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="$ROLE"
done

# 6. Allow the WIF provider to impersonate the service account
POOL_RESOURCE=$(gcloud iam workload-identity-pools describe $POOL_ID \
  --project=$PROJECT_ID \
  --location="global" \
  --format="value(name)")

gcloud iam service-accounts add-iam-policy-binding \
  $SA_NAME@$PROJECT_ID.iam.gserviceaccount.com \
  --project=$PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/${POOL_RESOURCE}/attribute.repository/$REPO"

# 7. Print GitHub secret values
echo ""
echo "=== Add these to GitHub → Settings → Secrets and variables → Actions ==="
echo ""
echo "GCP_PROJECT_ID=$PROJECT_ID"
echo ""
echo "GCP_SERVICE_ACCOUNT=$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"
echo ""
echo "GCP_WORKLOAD_IDENTITY_PROVIDER=$(gcloud iam workload-identity-pools providers describe $PROVIDER_ID \
  --project=$PROJECT_ID \
  --location="global" \
  --workload-identity-pool=$POOL_ID \
  --format="value(name)")"
