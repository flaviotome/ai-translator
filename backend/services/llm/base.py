from abc import ABC, abstractmethod


class BaseLLMService(ABC):
    @abstractmethod
    async def translate(self, text: str, source_lang: str, target_lang: str) -> str:
        pass
