from typing import Any, AsyncIterator

from openai import APIError, APITimeoutError, AsyncOpenAI
from openai.types.chat.chat_completion_chunk import ChatCompletionChunk
from pydantic import BaseModel, ConfigDict

from common_imports import Span
from exceptions.plugin_exc import PluginExc, llm_plugin_error


class BaseLLMModel(BaseModel):
    name: str
    llm: AsyncOpenAI

    model_config = ConfigDict(arbitrary_types_allowed=True)

    async def create_completion(self, messages: list, stream: bool) -> Any:
        return await self.llm.chat.completions.create(
            messages=messages,
            stream=stream,
            model=self.name,
        )

    def _log_messages_to_span(self, sp: Span, messages: list) -> None:
        """Log messages to span"""
        for message in messages:
            sp.add_info_events({message.get("role"): message.get("content")})

    def _log_request_info_to_span(self, sp: Span, stream: bool) -> None:
        """Log request information to span"""
        sp.add_info_events({"model": self.name})
        sp.add_info_events({"stream": stream})

    def _handle_api_timeout_error(self, error: APITimeoutError) -> None:
        """Handle API timeout error"""
        raise PluginExc(-1, "请求服务超时", om=str(error)) from error

    def _handle_api_error(self, error: APIError, sp: Span | None) -> None:
        """Handle API error"""
        if sp is not None:
            sp.add_info_events({"code": error.code or "null"})
            sp.add_info_events({"message": error.message})
            sp.add_info_events(
                {"converted-code": str(getattr(error, "code", "unknown"))}
            )
            sp.add_info_events({"converted-message": error.message})
        llm_plugin_error(error.code, error.message)

    def _handle_general_error(self, error: Exception, sp: Span | None) -> None:
        """Handle general error (ValueError, TypeError, KeyError)"""
        if sp is not None:
            sp.add_info_events({"code": ""})
            sp.add_info_events({"message": str(error)})
            sp.add_info_events({"converted-code": "-1"})
            sp.add_info_events({"converted-message": str(error)})
        llm_plugin_error("-1", str(error))

    def _get_error_message_for_exception(self, error: Exception) -> str:
        """Generate appropriate error message based on exception type"""
        error_type = type(error).__name__
        error_msg = str(error)
        error_msg_lower = error_msg.lower()

        if "ssl" in error_msg_lower or "certificate" in error_msg_lower:
            return (
                f"SSL certificate error: {error_msg}. "
                "Try setting SKIP_SSL_VERIFY=true for testing."
            )
        elif "connection" in error_msg_lower or "connect" in error_msg_lower:
            return (
                f"Connection error: {error_msg}. "
                "Please check network connectivity and API endpoint."
            )
        elif "timeout" in error_msg_lower:
            return (
                f"Request timeout: {error_msg}. "
                "The server took too long to respond."
            )
        else:
            return f"{error_type}: {error_msg}"

    def _handle_exception(self, error: Exception, sp: Span | None) -> None:
        """Handle general exceptions including SSL and connection errors"""
        error_type = type(error).__name__
        error_msg = str(error)

        if sp is not None:
            sp.add_error_event(f"LLM request failed: {error_type}: {error_msg}")

        error_message = self._get_error_message_for_exception(error)
        llm_plugin_error("-1", error_message)

    async def stream(
        self, messages: list, stream: bool, span: Span | None = None
    ) -> AsyncIterator[ChatCompletionChunk]:

        sp = span

        if sp is not None:
            self._log_messages_to_span(sp, messages)
            self._log_request_info_to_span(sp, stream)

        try:
            response = await self.create_completion(messages, stream)
            async for chunk in response:
                chunk_dict = chunk.model_dump()

                if sp is not None:
                    sp.add_info_events({"llm-chunk": chunk.model_dump_json()})

                if chunk_dict.get("code", 0) != 0:
                    llm_plugin_error(
                        chunk_dict.get("code"), chunk_dict.get("message")
                    )

                yield chunk

        except APITimeoutError as e:
            self._handle_api_timeout_error(e)
        except APIError as error:
            self._handle_api_error(error, sp)
        except Exception as e:
            self._handle_exception(e, sp)
