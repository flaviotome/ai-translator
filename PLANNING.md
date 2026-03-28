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

- [ ] Electron app scaffold (Vite + React + TypeScript + Tailwind)
- [ ] Floating transparent window (420×280, always-on-top, frameless)
- [ ] `preload.js` with `contextBridge` (no direct ipcRenderer in renderer)
- [ ] `TranslatorBox` component (text input + translation output)
- [ ] `LanguageToggle` component (EN ↔ PT)
- [ ] `useTranslate` hook (debounced API call, 500ms)
- [ ] HTTP client (`api/translate.js`) calling `http://localhost:8000/translate`
- [ ] Loading state while waiting for backend
- [ ] Error state (backend unreachable or timeout)

---

### M3 — Integration & Polish
> Goal: both components running together seamlessly.

- [ ] End-to-end test: type in Electron → translation appears
- [ ] Handle backend cold start (first request may be slow)
- [ ] Window positioning near cursor
- [ ] Keyboard shortcut to show/hide panel (Ctrl+Shift+T)
- [ ] Graceful error messages (network down, API key invalid, etc.)

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
