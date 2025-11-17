from abc import ABC
from typing import AsyncGenerator, Dict, List, Tuple


class ChatResponse(ABC):

    def __init__(self, content: str, total_tokens: int) -> None:
        self.content = content
        self.total_tokens = total_tokens

    def __repr__(self) -> str:
        return f"ChatResponse(content={self.content}, total_tokens={self.total_tokens})"


class BaseLLM(ABC):
    def __init__(self) -> None:
        pass

    def chat(self, messages: List[Dict]) -> ChatResponse:
        raise NotImplementedError

    async def stream_chat(
        self, messages: List[Dict], **kwargs
    ) -> AsyncGenerator[Tuple[ChatResponse, bool], None]:
        raise NotImplementedError
        yield  # Make this an async generator
