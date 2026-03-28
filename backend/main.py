from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import translate

app = FastAPI(title="AI Translator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(translate.router)


@app.get("/health")
def health():
    return {"status": "ok"}
