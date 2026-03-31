# AI Translator — Project Planning

## Status Legend
- `[ ]` To do
- `[~]` In progress
- `[x]` Done
- `[!]` Blocked

---

## Milestones

### M1 — Backend v1 (in progress)
> Goal: working FastAPI backend that translates text via Gemini, ready to be called by the frontend.

#### Completed
- [x] Project scaffold (FastAPI, routers, services, Pydantic models)
- [x] Gemini integration via `google-genai` SDK (`gemini-2.5-flash`)
- [x] `POST /translate` endpoint
- [x] `GET /health` endpoint
- [x] LLM abstraction layer (`BaseLLMService` + registry in `config.py`)
- [x] Unit tests (health, empty input, success mock, LLM failure)
- [x] Live integration test (`test_live.py`) — confirmed working
- [x] venv setup with `requirements.txt`

#### To do
- [x] **CORS middleware** — `main.py` — `CORSMiddleware(allow_origins=["*"])`
- [x] **Fix sync-inside-async** — `services/llm/gemini.py` — switched to `await self.client.aio.models.generate_content(...)`
- [x] **Singleton service (DI)** — `routers/translate.py` — `@lru_cache` + `Depends()`
- [x] **Input validation** — `routers/translate.py` — Pydantic `field_validator`: strips control chars, 5000-char max
- [x] **Update tests** — `tests/test_translate.py` — using `app.dependency_overrides`; added whitespace-only and oversized input tests. **6/6 passing.**

---

### M2 — Frontend v1
> Goal: Electron + React floating window that captures typing and shows translation.

- [x] Electron app scaffold (Vite + React + JavaScript + Tailwind)
- [x] Floating transparent window (420×280, always-on-top, frameless)
- [x] `preload.js` with `contextBridge` (no direct ipcRenderer in renderer)
- [x] `TranslatorBox` component (text input + translation output)
- [x] `LanguageToggle` component (EN ↔ PT)
- [x] `useTranslate` hook (debounced API call, 500ms)
- [x] HTTP client (`api/translate.js`) calling `http://localhost:8000/translate`
- [x] Loading state while waiting for backend
- [x] Error state (backend unreachable or timeout)

---

### M3 — Integration & Polish
> Goal: both components running together seamlessly.

- [x] End-to-end test: type in Electron → translation appears (verified manually)
- [x] Handle backend cold start — health check on mount, yellow dot + banner if backend is down
- [x] Window positioning near cursor — `getWindowPosition()` in `electron/main.js`
- [x] Keyboard shortcut to show/hide panel (`Ctrl+Shift+T`) — `globalShortcut` in `electron/main.js`
- [x] Graceful error messages — network unreachable, 502/API key error, timeout all have distinct messages

---

### M4 — CI/CD & Deploy
> Goal: automated pipeline that tests, builds and deploys the backend to GCP Cloud Run and packages the desktop app for distribution.

#### Completed
- [x] GitHub Actions — `ci.yml`: backend pytest + Vite build check on every push/PR
- [x] GitHub Actions — `deploy-backend.yml`: build Docker image → Artifact Registry → Cloud Run on push to master
- [x] GitHub Actions — `build-desktop.yml`: build Windows NSIS installer and create GitHub Release on version tag
- [x] `infra/docker/Dockerfile` — Python 3.11-slim, non-root user, configurable PORT
- [x] `infra/docker/docker-compose.yml` — local containerized dev environment
- [x] `infra/gcp/cloudrun.yaml` — Cloud Run service config (minScale 0, Secret Manager integration)
- [x] `infra/gcp/cloudbuild.yaml` — Cloud Build pipeline as alternative to GitHub Actions
- [x] `infra/scripts/setup-gcp.sh` — one-time GCP bootstrap script
- [x] `VITE_BACKEND_URL` env var — frontend backend URL configurable at build time
- [x] `electron-builder` — NSIS Windows installer packaging

#### To do
- [ ] **Configure GitHub Secrets** — add `GCP_PROJECT_ID`, `GCP_SA_KEY`, `GCP_REGION` and `PRODUCTION_BACKEND_URL` to the repository secrets on GitHub (`Settings → Secrets and variables → Actions`)
- [ ] **Bootstrap GCP project** — run `bash infra/scripts/setup-gcp.sh <PROJECT_ID>`, add real `GEMINI_API_KEY` to Secret Manager, copy `sa-key.json` to GitHub Secrets then delete locally
- [ ] **First backend deploy to Cloud Run** — merge to `master` to trigger `deploy-backend.yml`; verify the service URL is reachable via `/health`
- [ ] **Configure frontend deploy** — add `PRODUCTION_BACKEND_URL` GitHub Secret with the Cloud Run URL; push a version tag (`git tag v1.0.0 && git push --tags`) to trigger the Windows installer build and GitHub Release

---

## Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-03-27 | Use `google-genai` SDK instead of raw `httpx` | Official SDK, cleaner API, confirmed working |
| 2026-03-27 | Model: `gemini-2.5-flash` | `gemini-2.0-flash` deprecated for new API keys |
| 2026-03-27 | Use `requirements.txt` + venv (not Poetry) | Simpler, matches v1 KISS principle |
| 2026-03-27 | No auth in v1 | Spec decision — design must allow adding it later |

---

## Known Issues

No open issues.
