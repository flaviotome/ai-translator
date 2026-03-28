# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A floating, transparent desktop translation app. The user types text and sees the translation appear below in real time. Supports English ↔ Portuguese switching. Translation is powered by LLM APIs (starting with Gemini). Built with a split backend/frontend architecture running independently and communicating over HTTP (localhost).

## Architecture

```
ai-translator/
├── backend/          # FastAPI — handles LLM communication
└── frontend/         # Electron + React — floating desktop window
```

## Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Python, FastAPI, httpx              |
| Frontend | Electron, React, Vite, Tailwind CSS |
| LLM      | Gemini API (v1 — extensible)        |
| Testing  | pytest (backend), Vitest (frontend) |

## Commands

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

### Testing
```bash
# Backend
pytest

# Frontend
npx vitest
```

## Backend (`/backend`)

### Structure
```
backend/
├── main.py               # FastAPI app entry point
├── routers/
│   └── translate.py      # POST /translate endpoint
├── services/
│   └── llm/
│       ├── base.py       # Abstract LLM interface
│       └── gemini.py     # Gemini implementation
├── config.py             # Env vars and settings
├── tests/
│   └── test_translate.py
└── requirements.txt
```

### Endpoint
```
POST /translate
Body:     { "text": string, "source_lang": "en" | "pt", "target_lang": "en" | "pt" }
Response: { "translated_text": string }
```

### Rules
- All LLM providers implement the abstract interface in `services/llm/base.py`. To add a new model, create a new file in `services/llm/` and register it in `config.py` — nothing else changes.
- Active LLM selected via `LLM_PROVIDER` env var.
- Keep routers thin — business logic lives in services.
- Return `400` for bad input, `502` if the LLM call fails.

## Frontend (`/frontend`)

### Structure
```
frontend/
├── electron/
│   ├── main.js          # BrowserWindow config (transparent, floating)
│   └── preload.js       # contextBridge only
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── TranslatorBox.jsx   # Input + output + language switcher
│   │   └── LanguageToggle.jsx  # EN ↔ PT toggle button
│   ├── hooks/
│   │   └── useTranslate.js     # Debounced API call logic
│   ├── api/
│   │   └── translate.js        # fetch wrapper for POST /translate
│   └── index.css
├── vite.config.js
└── package.json
```

### Window config
```js
new BrowserWindow({
  width: 420,
  height: 280,
  transparent: true,
  frame: false,
  alwaysOnTop: true,
  resizable: false,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
  }
})
```

### Rules
- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` — non-negotiable.
- All Main↔Renderer communication via `contextBridge` in `preload.js`.
- Translation triggers automatically on typing with ~500ms debounce — no submit button.
- Language switch flips both `source_lang`/`target_lang` and re-triggers translation.
- To add a new language, only one config/constants file should need updating.

## Environment Variables

```
# backend/.env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_key_here
BACKEND_PORT=8000
```

Frontend calls `http://localhost:8000` — no env config needed in v1.

## Principles

- **KISS**: Simplest solution that works. No over-engineering.
- **No unrequested features**: Build only what is described. Ask before adding anything extra.
- **Modularization**: Adding a new language or LLM model should require touching only one config/registry file.
- **Minimal comments**: Only comment non-obvious logic.
- **Tests when necessary**: Cover business logic, API endpoints, and anything that could break silently. Skip trivial wiring code.

## v1 Scope — What NOT to build

- No authentication, login, or user accounts
- No translation history or persistence
- No support for more than 2 languages (EN/PT)
- No settings panel
- No auto-start on OS boot

Keep the architecture open for these but do not implement them now.
