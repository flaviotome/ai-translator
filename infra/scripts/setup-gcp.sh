#!/bin/bash
# Run once to configure the GCP project from scratch.
# Usage: bash setup-gcp.sh <PROJECT_ID>

set -e

PROJECT_ID=$1
REGION="us-central1"

if [ -z "$PROJECT_ID" ]; then
  echo "Usage: $0 <PROJECT_ID>"
  exit 1
fi

echo "→ Configuring project: $PROJECT_ID"

gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  iam.googleapis.com \
  --project=$PROJECT_ID

gcloud artifacts repositories create ai-translator \
  --repository-format=docker \
  --location=$REGION \
  --project=$PROJECT_ID

echo "PLACEHOLDER" | gcloud secrets create gemini-api-key \
  --data-file=- \
  --project=$PROJECT_ID

SA_NAME="ai-translator-deploy"
gcloud iam service-accounts create $SA_NAME \
  --display-name="AI Translator GitHub Actions Deploy" \
  --project=$PROJECT_ID

SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/iam.serviceAccountUser"

gcloud iam service-accounts keys create sa-key.json \
  --iam-account=$SA_EMAIL \
  --project=$PROJECT_ID

echo ""
echo "✓ Setup complete."
echo ""
echo "Next steps:"
echo "  1. Fill the real Gemini key in Secret Manager:"
echo "     gcloud secrets versions add gemini-api-key --data-file=- --project=$PROJECT_ID"
echo ""
echo "  2. Add these secrets to GitHub Actions:"
echo "     GCP_PROJECT_ID = $PROJECT_ID"
echo "     GCP_SA_KEY     = \$(base64 -w 0 sa-key.json)"
echo "     GCP_REGION     = $REGION"
echo ""
echo "  3. Delete sa-key.json after copying it to GitHub Secrets."
echo "     rm sa-key.json"
