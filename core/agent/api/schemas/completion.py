from typing import List, Literal, Optional

from openai.types.chat.chat_completion import ChatCompletion, Choice
from openai.types.chat.chat_completion_message import ChatCompletionMessage
from openai.types.chat.chat_completion_message_tool_call import (
    ChatCompletionMessageToolCall,
    Function,
)
from pydantic import Field


class ReasonChoiceMessageToolCallFunction(Function):
    arguments: Optional[str] = None
    name: Optional[str] = None
    response: Optional[str] = None


class ReasonChoiceMessageToolCall(ChatCompletionMessageToolCall):
    id: str = Field(default="")
    reason: str = Field(default="")
    function: Optional[ReasonChoiceMessageToolCallFunction] = None
    type: Optional[Literal["workflow", "tool", "knowledge"]] = None


class ReasonChoiceMessage(ChatCompletionMessage):
    reasoning_content: Optional[str] = Field(default="")
    content: Optional[str] = Field(default="")
    tool_calls: Optional[List[ReasonChoiceMessageToolCall]] = Field(
        default_factory=list
    )
    role: Optional[Literal["assistant"]] = Field(default="assistant")


class ReasonChoice(Choice):
    index: Optional[int] = Field(default=0)
    message: ReasonChoiceMessage  # pyright: ignore[reportIncompatibleVariableOverride]
    finish_reason: Optional[
        Literal["stop", "length", "tool_calls", "content_filter", "function_call"]
    ] = None


class ReasonChatCompletion(ChatCompletion):
    choices: List[ReasonChoice] = Field(default_factory=list)
    code: int = Field(default=0)
    message: str = Field(default="success")
    logs: list[str] = Field(default_factory=list)
    knowledge_metadata: list[str] = Field(default_factory=list)
