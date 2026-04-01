# AI Translator

A floating, transparent desktop translation app. Type text and see the translation appear in real time. Supports English ↔ Portuguese switching, powered by the Gemini API.

## Architecture

```
ai-translator/
├── backend/       # FastAPI — handles LLM communication
├── frontend/      # Electron + React — floating desktop window
└── infra/         # Docker, GCP Cloud Run, GitHub Actions
```

| Layer | Technology |
|---|---|
| Backend | Python, FastAPI |
| Frontend | Electron, React, Vite, Tailwind CSS |
| LLM | Gemini API (gemini-2.5-flash) |
| Deploy | GCP Cloud Run + GitHub Actions |

---

## Running locally

### Prerequisites

- Python 3.11+
- Node.js 20+
- A [Gemini API key](https://ai.google.dev/gemini-api/docs/api-key)

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows
pip install -r requirements.txt

# create backend/.env
echo GEMINI_API_KEY=your_key_here > .env
echo LLM_PROVIDER=gemini >> .env

uvicorn main:app --reload --port 8001
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

This starts the Vite dev server and opens the Electron window automatically. Use `Ctrl+Shift+T` to show/hide the window.

---

## API

```
POST /translate
Body:     { "text": string, "source_lang": "en" | "pt", "target_lang": "en" | "pt" }
Response: { "translated_text": string }

GET /health   → { "status": "ok" }
GET /ping     → { "message": "pong", "backend": "alive" }
```

---

## Testing

```bash
# Backend
cd backend
pytest tests/ -v

# Frontend (build check)
cd frontend
npm run build
```

---

## Project structure

### Backend

```
backend/
├── main.py               # FastAPI app entry point
├── config.py             # Env vars and LLM provider registry
├── routers/
│   └── translate.py      # POST /translate endpoint
├── services/
│   └── llm/
│       ├── base.py       # Abstract LLM interface
│       └── gemini.py     # Gemini implementation
└── tests/
    ├── test_translate.py
    └── test_security.py
```

### Frontend

```
frontend/
├── electron/
│   ├── main.js           # BrowserWindow config (transparent, floating)
│   └── preload.js        # contextBridge only
└── src/
    ├── App.jsx
    ├── api/translate.js  # fetch wrapper for POST /translate
    ├── hooks/useTranslate.js  # debounced API call + AbortController
    └── components/
        ├── TranslatorBox.jsx
        └── LanguageToggle.jsx
```

### Infrastructure

```
infra/
├── docker/
│   ├── Dockerfile          # backend container image
│   └── docker-compose.yml  # local containerized dev
└── gcp/
    ├── cloudrun.yaml       # Cloud Run service definition
    └── cloudbuild.yaml     # Cloud Build pipeline
```

---

## CI/CD

| Workflow | Trigger | Action |
|---|---|---|
| `ci.yml` | Push / PR | Run backend tests + Vite build check |
| `deploy-backend.yml` | Push to `master` | Build image → Artifact Registry → Cloud Run |
| `build-desktop.yml` | Tag `v*.*.*` | Build Windows installer → GitHub Release |

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `GCP_PROJECT_ID` | GCP project ID |
| `GCP_SA_KEY` | Service account key (base64) |
| `GCP_REGION` | GCP region (e.g. `us-central1`) |
| `PRODUCTION_BACKEND_URL` | Cloud Run service URL |

To bootstrap the GCP project:

```bash
bash infra/scripts/setup-gcp.sh YOUR_PROJECT_ID
```

---

## Environment variables

```bash
# backend/.env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
BACKEND_PORT=8001
```

The frontend reads `VITE_BACKEND_URL` at build time (defaults to `http://localhost:8001`).

---

## Releasing a new version

```bash
git tag v1.0.0
git push --tags
```

This triggers the `build-desktop.yml` workflow, which builds the Windows installer and creates a GitHub Release automatically.
