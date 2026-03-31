import os
from dotenv import load_dotenv

load_dotenv()

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
BACKEND_PORT = int(os.getenv("BACKEND_PORT", "8001"))

LLM_REGISTRY = {
    "gemini": "services.llm.gemini.GeminiService",
}
