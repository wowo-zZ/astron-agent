"""
Knowledge Pro Node implementation for advanced knowledge base operations.

This module provides a specialized node for performing RAG (Retrieval-Augmented Generation)
operations using various knowledge repositories and LLM providers.
"""

import asyncio
import json
import os
from typing import Any, List, Literal, Tuple

import aiohttp
import httpx
from aiohttp import ClientResponse, ClientTimeout
from pydantic import Field

from workflow.engine.entities.node_entities import NodeType
from workflow.engine.entities.variable_pool import VariablePool
from workflow.engine.nodes.base_node import BaseNode
from workflow.engine.nodes.entities.node_run_result import (
    NodeRunResult,
    WorkflowNodeExecutionStatus,
)
from workflow.engine.nodes.knowledge_pro.consts import RagTypeEnum, RepoTypeEnum
from workflow.exception.e import CustomException
from workflow.exception.errors.err_code import CodeEnum
from workflow.extensions.otlp.log_trace.node_log import NodeLog
from workflow.extensions.otlp.trace.span import Span


class KnowledgeProNode(BaseNode):
    """
    Knowledge Pro Node for advanced knowledge base operations.

    This node performs RAG (Retrieval-Augmented Generation) operations by querying
    knowledge repositories and generating responses using configured LLM providers.
    Supports streaming responses and various repository types.
    """

    # LLM configuration parameters
    model: str = Field(..., min_length=1)  # LLM model identifier
    url: str = Field(..., min_length=1)  # Base URL for LLM API endpoint
    domain: str = Field(..., min_length=1)  # Domain specification for the model
    appId: str = Field(..., min_length=1)  # Application ID for authentication
    apiKey: str = Field(..., min_length=1)  # API key for authentication
    apiSecret: str = Field(..., min_length=1)  # API secret for authentication
    temperature: float = Field(
        ..., gt=0.0, le=1.0
    )  # Temperature parameter for response generation (0.0-1.0)
    maxTokens: int = Field(..., ge=1)  # Maximum number of tokens in response
    topK: int = Field(..., ge=1, le=6)  # Top-K parameter for response generation (1-6)
    uid: str = Field(default="")  # User identifier (optional)

    # RAG configuration parameters
    ragType: Literal[1, 2] = Field(...)  # RAG type (1: AGENTIC_RAG, 2: LONG_RAG)
    repoIds: List[str] = Field(..., min_length=1)  # List of repository IDs to query
    docIds: List[str] = Field(
        ..., default_factory=list
    )  # List of document IDs (required for CBG_RAG)
    repoType: Literal[1, 2] = Field(...)  # Repository type (1: AIUI_RAG2, 2: CBG_RAG)
    repoTopK: int = Field(..., ge=1, le=5)  # Number of top documents to retrieve (1-5)
    answerRole: str = Field(default="")  # Role specification for answer generation
    score: float = Field(default=0.1)  # Score threshold for document relevance

    @property
    def run_s(self) -> WorkflowNodeExecutionStatus:
        """
        Get the success execution status.

        :return: SUCCEEDED status for successful execution
        """
        return WorkflowNodeExecutionStatus.SUCCEEDED

    @property
    def run_f(self) -> WorkflowNodeExecutionStatus:
        """
        Get the failure execution status.

        :return: FAILED status for failed execution
        """
        return WorkflowNodeExecutionStatus.FAILED

    async def _check_cbg_rag_param(self) -> None:
        """
        Validate CBG RAG parameters.

        Ensures that docIds is not empty when using CBG_RAG repository type,
        as document IDs are required for CBG RAG operations.

        :raises CustomException: If docIds is empty for CBG_RAG repository type
        """
        if self.repoType == RepoTypeEnum.CBG_RAG.value and self.docIds == []:
            raise CustomException(
                err_code=CodeEnum.KNOWLEDGE_PARAM_ERROR, err_msg="docIds is empty"
            )

    async def execute(
        self, variable_pool: VariablePool, span: Span, **kwargs: Any
    ) -> NodeRunResult:
        """
        Execute the Knowledge Pro node operation.

        Performs RAG operations by querying knowledge repositories and generating
        responses using the configured LLM provider. Supports streaming responses
        and handles various error conditions.

        :param variable_pool: Pool of variables for the workflow execution
        :param span: Tracing span for observability
        :param kwargs: Additional keyword arguments including msg_or_end_node_deps
        :return: NodeRunResult containing execution status and outputs
        """
        msg_or_end_node_deps = kwargs.get("msg_or_end_node_deps", {})

        query = variable_pool.get_variable(
            node_id=self.node_id, key_name=self.input_identifier[0], span=span
        )
        inputs, outputs = {self.input_identifier[0]: query}, {}
        query = str(query) if not isinstance(query, str) else query

        # Set timeout based on retry configuration
        interval_timeout = (
            self.retry_config.timeout if self.retry_config.should_retry else None
        )

        try:
            # Get the Knowledge Pro API endpoint URL from environment or use default
            url = f"{os.getenv('KNOWLEDGE_PRO_BASE_URL')}/knowledge/v1/agent/achat"

            # Validate CBG RAG parameters before proceeding
            await self._check_cbg_rag_param()

            # Generate request payload for the Knowledge Pro API
            payload = self.gen_req_payload(query, span)
            span.add_info_event(f"request body: {payload}")
            # Create HTTP session with appropriate timeout configuration
            async with aiohttp.ClientSession(
                timeout=ClientTimeout(
                    total=30 * 60, sock_connect=30, sock_read=interval_timeout
                )
            ) as session:
                # Send POST request to Knowledge Pro API
                async with session.post(url=url, json=payload) as response:
                    if response.status != httpx.codes.OK:
                        raise CustomException(
                            err_code=CodeEnum.KNOWLEDGE_REQUEST_ERROR,
                            cause_error=f"Knowledge Pro node response status: {response.status}",
                        )

                    content_list, knowledge_metadata = await self._handle_response(
                        response, span, variable_pool, msg_or_end_node_deps
                    )

            # Prepare final outputs with combined content and metadata
            outputs = {"output": "".join(content_list), "result": knowledge_metadata}
        except asyncio.TimeoutError:
            # Handle timeout errors during API request
            log_err = CustomException(
                err_code=CodeEnum.KNOWLEDGE_NODE_EXECUTION_ERROR,
                err_msg=f"Knowledge Pro node response timeout ({interval_timeout}s)",
            )
            span.record_exception(log_err)
            return NodeRunResult(
                status=self.run_f,
                error=log_err,
                node_id=self.node_id,
                alias_name=self.alias_name,
                node_type=self.node_type,
            )
        except CustomException as err:
            # Handle custom application errors
            span.record_exception(err)
            return NodeRunResult(
                status=self.run_f,
                error=err,
                node_id=self.node_id,
                alias_name=self.alias_name,
                node_type=self.node_type,
            )
        except Exception as e:
            # Handle unexpected errors
            span.record_exception(e)
            return NodeRunResult(
                status=self.run_f,
                error=CustomException(
                    CodeEnum.KNOWLEDGE_NODE_EXECUTION_ERROR,
                    cause_error=e,
                ),
                node_id=self.node_id,
                alias_name=self.alias_name,
                node_type=self.node_type,
            )

        return NodeRunResult(
            status=self.run_s,
            inputs=inputs,
            outputs=outputs,
            raw_output="".join(content_list),
            node_id=self.node_id,
            alias_name=self.alias_name,
            node_type=self.node_type,
        )

    async def _handle_response(
        self,
        response: ClientResponse,
        span: Span,
        variable_pool: VariablePool,
        msg_or_end_node_deps: dict,
    ) -> Tuple[list, list]:
        """
        Handle response from Knowledge Pro API.

        :param response: Response from Knowledge Pro API
        :param span: Tracing span for observability
        :param variable_pool: Pool of variables for the workflow execution
        :param msg_or_end_node_deps: Message or end node dependencies
        :return: Tuple of content list and knowledge metadata
        """

        # Collection of knowledge base content frames
        content_list: list = []
        # Knowledge base metadata
        knowledge_metadata: list = []

        # Process streaming response line by line
        async for line in response.content:
            line_str = line.decode("utf-8")
            # Skip empty lines
            if line_str == "\n":
                continue
            span.add_info_event(f"recv: {line_str}")
            # Remove SSE data prefix
            line_str = line_str.removeprefix("data: ")
            # Handle stream completion signal
            if line_str.startswith("[DONE]"):
                await self.put_stream_content(
                    self.node_id,
                    variable_pool,
                    msg_or_end_node_deps,
                    NodeType.KNOWLEDGE_PRO.value,
                    self.get_stream_done_content(),
                )
                break

            # Parse JSON message from stream
            msg = json.loads(line_str)
            content_type = msg.get("data", {}).get("content_type", "answer")

            # Handle error responses from the API
            if msg.get("code", 0) != 0:
                await self.put_stream_content(
                    self.node_id,
                    variable_pool,
                    msg_or_end_node_deps,
                    NodeType.KNOWLEDGE_PRO.value,
                    self.get_stream_done_content(),
                )
                raise CustomException(
                    err_code=CodeEnum.KNOWLEDGE_REQUEST_ERROR,
                    err_msg=msg.get("message", ""),
                    cause_error=json.dumps(msg, ensure_ascii=False),
                )

            # Process answer content type
            if content_type == "answer":
                content = msg.get("data", {}).get("content", "")
                content_list += [content] if content else []
                # Put stream content frame into msg_or_end_node_deps
                await self.put_stream_content(
                    self.node_id,
                    variable_pool,
                    msg_or_end_node_deps,
                    NodeType.KNOWLEDGE_PRO.value,
                    msg,
                )

            # Extract knowledge metadata if present
            knowledge_metadata = (
                msg.get("data", {}).get("content", [])
                if content_type == "knowledge_metadata"
                else []
            )

        return content_list, knowledge_metadata

    async def async_execute(
        self,
        variable_pool: VariablePool,
        span: Span,
        event_log_node_trace: NodeLog | None = None,
        **kwargs: Any,
    ) -> NodeRunResult:
        """
        Asynchronous execution method.

        Delegates to the main execute method for performing RAG operations.

        :param variable_pool: Pool of variables for the workflow execution
        :param span: Tracing span for observability
        :param event_log_node_trace: Optional node log trace
        :param kwargs: Additional keyword arguments
        :return: NodeRunResult containing execution status and outputs
        """
        return await self.execute(variable_pool, span, **kwargs)

    def gen_req_payload(self, query: str, span: Span) -> dict:
        """
        Generate request payload for Knowledge Pro API.

        Creates a properly formatted request payload containing all necessary
        configuration parameters for RAG operations including repository settings,
        LLM configuration, and user query.

        :param query: User query/question to be processed
        :param span: Tracing span for observability
        :return: Dictionary containing the complete request payload
        """
        return {
            "prompt": self.answerRole,
            "rag": {
                "type": RepoTypeEnum.getitem(self.repoType),
                "repo_id": self.repoIds,
                "doc_id": self.docIds,
                "topN": self.repoTopK,
                "mode": RagTypeEnum.getitem(self.ragType),
                "threshold": self.score,
                "llm": {
                    "app_id": self.appId,
                    "api_key": self.apiKey,
                    "api_secret": self.apiSecret,
                    "base_url": self.url,
                    "model": self.domain,
                    "max_token": self.maxTokens,
                    "top_k": self.topK,
                    "temperature": self.temperature,
                },
            },
            "messages": [{"role": "user", "content": query}],
            "meta_data": {"caller": "workflow", "caller_sid": span.sid},
        }
