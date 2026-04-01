# AI Translator

A floating, transparent desktop translation app. Type text and see the translation appear below in real time. Supports English ↔ Portuguese switching, powered by Google Gemini.

## Architecture

```
ai-translator/
├── backend/         # FastAPI — handles LLM communication
├── frontend/        # Electron + React — floating desktop window
└── infra/           # Docker, GCP config, setup scripts
```

## Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Python, FastAPI, httpx              |
| Frontend | Electron, React, Vite, Tailwind CSS |
| LLM      | Gemini API (gemini-2.5-flash)       |
| Deploy   | GCP Cloud Run (backend), GitHub Releases (frontend) |

## Running Locally

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

Requires a `backend/.env` file:

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
BACKEND_PORT=8001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

This starts both the Vite dev server and Electron together.

## API

```
POST /translate
Body:     { "text": string, "source_lang": "en" | "pt", "target_lang": "en" | "pt" }
Response: { "translated_text": string }

GET /ping
Response: { "message": "pong", "backend": "alive" }
```

## Tests

```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npx vitest
```

## Project Structure

```
backend/
├── main.py                  # FastAPI entry point
├── routers/translate.py     # POST /translate endpoint
├── services/llm/
│   ├── base.py              # Abstract LLM interface
│   └── gemini.py            # Gemini implementation
├── config.py                # Env vars and settings
└── tests/

frontend/
├── electron/
│   ├── main.js              # BrowserWindow config
│   └── preload.js           # contextBridge only
└── src/
    ├── App.jsx
    ├── components/
    │   ├── TranslatorBox.jsx
    │   └── LanguageToggle.jsx
    ├── hooks/useTranslate.js # Debounced API call logic
    └── api/translate.js      # fetch wrapper
```

## CI/CD

GitHub Actions workflows:

| Workflow | Trigger | What it does |
|----------|---------|--------------|
| `ci.yml` | Push / PR | Runs backend tests + frontend build |
| `deploy-backend.yml` | Push to `master` or manual | Builds Docker image, pushes to Artifact Registry, deploys to Cloud Run |
| `build-desktop.yml` | Tag `v*.*.*` | Builds Windows installer, creates GitHub Release |

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `GCP_PROJECT_ID` | GCP project ID |
| `GCP_REGION` | GCP region (e.g. `us-central1`) |
| `GCP_SA_KEY` | Service account key (base64) |
| `PRODUCTION_BACKEND_URL` | Cloud Run service URL |

## Production

Backend is deployed on GCP Cloud Run:

```
https://ai-translator-backend-txamt66xzq-uc.a.run.app
```

## Desktop Release

To build and release a new Windows installer, push a version tag:

```bash
git tag v1.0.0
git push --tags
```

This triggers `build-desktop.yml`, which produces a `.exe` installer and publishes a GitHub Release.

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `LLM_PROVIDER` | backend `.env` | Active LLM (`gemini`) |
| `GEMINI_API_KEY` | backend `.env` / GCP Secret Manager | Gemini API key |
| `BACKEND_PORT` | backend `.env` | Port for uvicorn (default `8001`) |
| `VITE_BACKEND_URL` | frontend build env | Backend URL (default `http://localhost:8001`) |
