import os
from google import genai
from google.genai import types
from services.llm.base import BaseLLMService

SYSTEM_PROMPT = "You are a translation assistant. Translate the given text accurately. Return only the translated text, nothing else."


class GeminiService(BaseLLMService):
    def __init__(self):
        self.client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
        self.model = "gemini-2.5-flash"

    async def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        prompt = f"Translate the following text from {source_lang} to {target_lang}:\n\n{text}"

        response = await self.client.aio.models.generate_content(
            model=self.model,
            contents=[
                types.Content(
                    role="user",
                    parts=[types.Part.from_text(text=prompt)],
                )
            ],
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.3,
                max_output_tokens=1024,
            ),
        )

        return response.text
