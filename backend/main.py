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
@app.head("/health")
def health():
    return {"status": "ok"}


@app.get("/ping")
def ping():
    return {"message": "pong", "backend": "alive"}


@app.get("/test-llm")
async def test_llm():
    import os
    from dotenv import load_dotenv
    load_dotenv()
    from google import genai
    try:
        client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
        r = await client.aio.models.generate_content(model="gemini-2.5-flash", contents="say hi")
        return {"ok": True, "response": r.text}
    except Exception as e:
        return {"ok": False, "error": type(e).__name__, "detail": str(e)}
