import httpx
from dotenv import load_dotenv
import os

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

response = httpx.get(
    "https://generativelanguage.googleapis.com/v1beta/models",
    headers={"x-goog-api-key": GEMINI_API_KEY},
)
print(f"Status: {response.status_code}")
models = response.json().get("models", [])
for m in models:
    print(m.get("name"))
