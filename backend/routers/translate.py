import logging
import re
from functools import lru_cache
from importlib import import_module

from fastapi import APIRouter, Depends, HTTPException

logger = logging.getLogger(__name__)
from pydantic import BaseModel, field_validator

from config import LLM_PROVIDER, LLM_REGISTRY
from services.llm.base import BaseLLMService

router = APIRouter()


class TranslateRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        v = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", v)
        if len(v) > 5000:
            raise ValueError("Text exceeds 5000 character limit")
        return v


class TranslateResponse(BaseModel):
    translated_text: str


@lru_cache(maxsize=1)
def get_llm_service() -> BaseLLMService:
    module_path, class_name = LLM_REGISTRY[LLM_PROVIDER].rsplit(".", 1)
    module = import_module(module_path)
    return getattr(module, class_name)()


@router.post("/translate", response_model=TranslateResponse)
async def translate(
    request: TranslateRequest,
    service: BaseLLMService = Depends(get_llm_service),
):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    try:
        translated = await service.translate(request.text, request.source_lang, request.target_lang)
    except Exception as e:
        print(f"[LLM ERROR] {type(e).__name__}: {e}", flush=True)
        raise HTTPException(status_code=502, detail="LLM service unavailable")

    return TranslateResponse(translated_text=translated)
