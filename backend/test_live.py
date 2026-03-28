import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = "You are a translation assistant. Translate the given text accurately. Return only the translated text, nothing else."


def translate(text: str, source_lang: str, target_lang: str) -> str:
    client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))
    prompt = f"Translate the following text from {source_lang} to {target_lang}:\n\n{text}"

    response = client.models.generate_content(
        model="gemini-2.5-flash",
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


if __name__ == "__main__":
    cases = [
        ("Hello, how are you?", "en", "pt"),
    ]

    for text, src, tgt in cases:
        print(f"[{src} -> {tgt}] {text}")
        result = translate(text, src, tgt)
        print(f"  -> {result}")
