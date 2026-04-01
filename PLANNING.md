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

- [x] Electron app scaffold (Vite + React + Tailwind)
- [x] Floating transparent window (420×280, always-on-top, frameless, ~70% transparency)
- [x] `preload.js` with `contextBridge` — exposes `close` and `minimize` via IPC
- [x] `TranslatorBox` component (text input + translation output)
- [x] `LanguageToggle` component (EN ↔ PT)
- [x] `useTranslate` hook (debounced API call, 2000ms + `AbortController` for cancellation)
- [x] HTTP client (`api/translate.js`) — configurable via `VITE_BACKEND_URL` env var
- [x] Loading state while waiting for backend
- [x] Error state (backend unreachable, timeout, abort)
- [x] Draggable header region (`-webkit-app-region: drag`)
- [x] Minimize and Close buttons (IPC → `ipcMain.handle`)
- [x] `electron-builder` config for Windows NSIS installer

---

### M3 — Integration & Polish
> Goal: both components running together seamlessly.

- [x] End-to-end test: type in Electron → translation appears (local dev confirmed)
- [x] Handle backend cold start (15s `AbortSignal.timeout` + user-facing message)
- [ ] Window positioning near cursor
- [ ] Keyboard shortcut to show/hide panel (Ctrl+Shift+T)
- [ ] Graceful error messages (network down, API key invalid, etc.)

---

### M4 — CI/CD & Deploy
> Goal: automated pipeline — backend on Cloud Run, frontend as GitHub Release.

#### Completed
- [x] `infra/docker/Dockerfile` — Python 3.11-slim, non-root user, port 8080
- [x] `infra/docker/.dockerignore`
- [x] `infra/docker/docker-compose.yml` — local Dockerized dev environment
- [x] `infra/gcp/cloudrun.yaml` — Cloud Run service definition
- [x] `infra/gcp/cloudbuild.yaml` — Cloud Build pipeline (test → build → push → deploy)
- [x] `infra/scripts/setup-gcp.sh` — one-time GCP project setup script
- [x] `.github/workflows/ci.yml` — runs on every push/PR (backend tests + frontend build)
- [x] `.github/workflows/deploy-backend.yml` — deploys to Cloud Run on push to `master`
- [x] `.github/workflows/build-desktop.yml` — builds Windows installer on version tag `v*.*.*`
- [x] GCP project configured (`ai-translator-prod-492013`)
- [x] Artifact Registry repository created
- [x] `gemini-api-key` secret in GCP Secret Manager
- [x] Service account `ai-translator-deploy` with required IAM roles
- [x] GitHub Repository secrets configured: `GCP_PROJECT_ID`, `GCP_REGION`, `GCP_SA_KEY`, `PRODUCTION_BACKEND_URL`
- [x] **First backend deploy succeeded** — service live at `https://ai-translator-backend-txamt66xzq-uc.a.run.app`

#### To do
- [ ] Add real `GEMINI_API_KEY` value to GCP Secret Manager (replace placeholder)
- [ ] Push version tag (`git tag v1.0.0 && git push --tags`) to trigger Windows installer build
- [ ] Verify GitHub Release with `.exe` installer is created after tag push

---

## Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-03-27 | Use `google-genai` SDK instead of raw `httpx` | Official SDK, cleaner API, confirmed working |
| 2026-03-27 | Model: `gemini-2.5-flash` | `gemini-2.0-flash` deprecated for new API keys |
| 2026-03-27 | Use `requirements.txt` + venv (not Poetry) | Simpler, matches v1 KISS principle |
| 2026-03-27 | No auth in v1 | Spec decision — design must allow adding it later |
| 2026-03-28 | Debounce raised to 2000ms + `AbortController` | Prevent excessive/out-of-order LLM requests |
| 2026-03-28 | `transparent: true` + CSS `bg-black/30` for window opacity | `backgroundMaterial` conflicts with `transparent` on Windows |
| 2026-03-30 | Use `ai-translator-deploy` SA as Cloud Run runtime SA | Default Compute SA lacks Secret Manager access |
| 2026-03-30 | Repository secrets (not Environment secrets) for GitHub Actions | Environment secrets require explicit `environment:` in job; causes PATH issues |

---

## Known Issues

No open issues.
