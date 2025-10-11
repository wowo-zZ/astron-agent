import json
import time
from typing import Any, AsyncIterator, Union

from pydantic import Field

from api.schemas.agent_response import AgentResponse, CotStep
from api.schemas.llm_message import LLMMessage, LLMMessages

# Use unified common package import module
from common_imports import Node, NodeData, NodeDataUsage, NodeTrace, Span
from domain.models.base import BaseLLMModel
from engine.nodes.base import RunnerBase, Scratchpad
from engine.nodes.cot.cot_prompt import (
    COT_SYSTEM_NO_R1_MORE_TEMPLATE,
    COT_SYSTEM_R1_MORE_TEMPLATE,
    COT_SYSTEM_TEMPLATE,
    COT_USER_TEMPLATE,
)
from engine.nodes.cot_process.cot_process_runner import CotProcessRunner
from exceptions import cot_exc
from service.plugin.base import BasePlugin, PluginResponse
from service.plugin.link import LinkPlugin
from service.plugin.mcp import McpPlugin
from service.plugin.workflow import WorkflowPlugin

default_cot_step = CotStep(empty=True)


class UpdatedNode(Node):
    node_name: str = Field(default="")


class CotRunner(RunnerBase):
    model: BaseLLMModel
    scratchpad: Scratchpad = Field(default_factory=Scratchpad)
    # plugins: list[BasePlugin]
    plugins: list[Union[BasePlugin, McpPlugin, LinkPlugin, WorkflowPlugin]]
    instruct: str = Field(default="")
    knowledge: str = Field(default="")
    question: str = Field(default="")
    process_runner: CotProcessRunner
    max_loop: int = Field(default=30)

    async def create_system_prompt(self) -> str:
        system_prompt = COT_SYSTEM_TEMPLATE.replace("{now}", self.cur_time())
        system_prompt = system_prompt.replace("{instruct}", self.instruct or "None")
        system_prompt = system_prompt.replace("{knowledge}", self.knowledge or "None")
        system_prompt = system_prompt.replace(
            "{tools}", "\n".join([tool.schema_template for tool in self.plugins])
        )
        system_prompt = system_prompt.replace(
            "{tool_names}", ",".join([tool.name for tool in self.plugins])
        )
        system_prompt = system_prompt.replace(
            "{r1_more}",
            (
                COT_SYSTEM_R1_MORE_TEMPLATE
                if self.model.name == "xdeepseekr1"
                else COT_SYSTEM_NO_R1_MORE_TEMPLATE
            ),
        )
        return system_prompt

    async def create_user_prompt(self) -> str:
        user_prompt = COT_USER_TEMPLATE.replace(
            "{chat_history}", await self.create_history_prompt()
        )
        user_prompt = user_prompt.replace("{question}", self.question)
        return user_prompt

    async def parse_cot_step(self, step_content: str) -> CotStep:
        """Parse CoT step content, extract thinking, action and other information"""

        # Handle Final Answer case
        if "Final Answer:" in step_content:
            if "Thought:" in step_content:
                thought_part = step_content.split("Final Answer:")[0]
                thought = thought_part.split("Thought:")[1].strip()
                return CotStep(thought=thought, finished_cot=True)
            return CotStep(finished_cot=True)

        # Extract thinking content
        thought = ""
        if "Thought:" in step_content:
            if "Action:" in step_content:
                thought_raw = step_content.split("Action:")[0]
            else:
                thought_raw = step_content
            thought = thought_raw.split("Thought:")[1].strip()

        # Check if contains action
        if "Action:" not in step_content or "Action Input:" not in step_content:
            raise cot_exc.CotFormatIncorrectExc

        # Extract action information
        try:
            _, right = step_content.split("Action:")
            action_raw, right = right.split("Action Input:")
            action = action_raw.strip()

            if not await self.is_valid_plugin(action):
                raise cot_exc.CotFormatIncorrectExc

            # Extract action input parameters
            action_input_raw = right.split("Observation:")[0].strip()
            action_input = json.loads(action_input_raw)

            return CotStep(thought=thought, action=action, action_input=action_input)

        except (ValueError, IndexError) as e:
            if isinstance(e, json.JSONDecodeError):
                raise cot_exc.CotFormatIncorrectExc
            raise cot_exc.CotFormatIncorrectExc

    async def read_response(
        self, messages: LLMMessages, first_loop: bool, span: Span, node_trace: NodeTrace
    ) -> AsyncIterator[AgentResponse]:

        with span.start("MakingStep") as sp:

            thinks = ""
            answers = ""

            step_content = ""
            final_answer = False

            # Node assignment
            node_id = ""
            node_sid = span.sid
            node_node_id = span.sid
            node_type = "LLM"
            node_name = "ReadResponse"
            node_start_time = int(round(time.time() * 1000))
            node_running_status = True
            node_data_input = {
                "read_response_input": json.dumps(messages.list(), ensure_ascii=False)
            }
            node_data_output: dict[str, Any] = {}
            node_data_config: dict[str, Any] = {}
            node_data_usage = NodeDataUsage()

            async for chunk in self.model.stream(messages.list(), True, sp):
                if not chunk.choices:
                    continue
                delta = chunk.choices[0].delta.model_dump()
                reasoning_content = delta.get("reasoning_content", "") or ""
                content: str = delta.get("content", "") or ""
                thinks += reasoning_content
                answers += content

                # Accumulate usage from chunks instead of resetting
                if chunk.usage:
                    usage_data = chunk.usage.model_dump()
                    node_data_usage.completion_tokens += usage_data.get(
                        "completion_tokens", 0
                    )
                    node_data_usage.prompt_tokens += usage_data.get(
                        "prompt_tokens", 0
                    )
                    node_data_usage.total_tokens += (
                        usage_data.get("total_tokens", 0)
                    )

                # Don't send usage in intermediate chunks
                if final_answer and content:
                    yield AgentResponse(
                        typ="content",
                        content=content,
                        model=self.model.name,
                        usage=None,
                    )
                    continue

                if reasoning_content:
                    yield AgentResponse(
                        typ="reasoning_content",
                        content=reasoning_content,
                        model=self.model.name,
                        usage=None,
                    )
                    continue

                step_content += content
                if first_loop:
                    if "Final Answer:" in step_content:
                        yield AgentResponse(
                            typ="content",
                            content=step_content.split("Final Answer:")[1],
                            model=self.model.name,
                            usage=None,
                        )
                        final_answer = True
                        continue

                if "Observation:" in step_content or "Final Answer:" in step_content:
                    break

            # Usage will be attached to stop chunk in _finalize_run
            sp.add_info_events({
                "accumulated_usage": {
                    "completion_tokens": node_data_usage.completion_tokens,
                    "prompt_tokens": node_data_usage.prompt_tokens,
                    "total_tokens": node_data_usage.total_tokens
                }
            })

            node_end_time = int(round(time.time() * 1000))
            data_llm_output = answers
            node_trace.trace.append(
                UpdatedNode(
                    id=node_id,
                    sid=node_sid,
                    node_id=node_node_id,
                    node_name=node_name,
                    node_type=node_type,
                    start_time=node_start_time,
                    end_time=node_end_time,
                    duration=node_end_time - node_start_time,
                    running_status=node_running_status,
                    llm_output=data_llm_output,
                    data=NodeData(
                        input=node_data_input if node_data_input else {},
                        output=node_data_output if node_data_output else {},
                        config=node_data_config if node_data_config else {},
                        usage=node_data_usage,
                    ),
                )
            )

            sp.add_info_events({"step-think": thinks})
            sp.add_info_events({"step-content": answers})

            if not final_answer:
                # Parse step_content
                yield AgentResponse(
                    typ="cot_step",
                    content=await self.parse_cot_step(step_content),
                    model=self.model.name,
                )

    async def _create_messages(
        self, system_prompt: str, user_prompt_template: str
    ) -> LLMMessages:
        """Create LLM messages for current iteration"""
        user_prompt = user_prompt_template.replace(
            "{scratchpad}",
            await self.scratchpad.template(),  # pylint: disable=no-member
        )

        return LLMMessages(
            messages=[
                LLMMessage(role="system", content=system_prompt),
                LLMMessage(role="user", content=user_prompt),
            ]
        )

    async def _process_agent_response(
        self, msgs: LLMMessages, is_first_loop: bool, sp: Span, node_trace: NodeTrace
    ) -> AsyncIterator[tuple[bool, CotStep, AgentResponse | None]]:
        """Process agent response and yield responses with final result"""
        cot_step: CotStep = default_cot_step
        yield_answer = False

        async for agent_response in self.read_response(
            msgs, is_first_loop, sp, node_trace
        ):
            if agent_response.typ in ["reasoning_content", "log"]:
                yield yield_answer, cot_step, agent_response
            elif agent_response.typ == "content":
                yield_answer = True
                yield yield_answer, cot_step, agent_response
            elif agent_response.typ == "cot_step":
                if isinstance(agent_response.content, CotStep):
                    cot_step = agent_response.content

        yield yield_answer, cot_step, None

    async def _handle_finished_cot(
        self, cot_step: CotStep, sp: Span, node_trace: NodeTrace
    ) -> AsyncIterator[AgentResponse]:
        """Handle finished CoT step"""
        self.scratchpad.steps.append(cot_step)  # pylint: disable=no-member
        async for agent_response in self.process_runner.run(
            self.scratchpad, sp, node_trace
        ):
            yield agent_response

    async def _handle_plugin_execution(
        self, cot_step: CotStep, plugin: Any, sp: Span, span: Span
    ) -> AsyncIterator[AgentResponse]:
        """Handle plugin execution"""
        if plugin and plugin.typ == "workflow":
            async for agent_response in self.run_workflow_plugin(plugin, cot_step, sp):
                yield agent_response
        elif plugin:
            cot_step.tool_type = "tool"
            plugin_response = await self.run_plugin(cot_step, span)
            if plugin.run_result is not None:
                plugin.run_result = plugin_response
            cot_step.action_output = plugin_response.result
            yield AgentResponse(typ="cot_step", content=cot_step, model=self.model.name)

    async def _run_single_loop(
        self,
        loop_count: int,
        system_prompt: str,
        user_prompt_template: str,
        sp: Span,
        node_trace: NodeTrace,
        span: Span,
    ) -> AsyncIterator[tuple[bool, bool, AgentResponse | None]]:
        """Run a single iteration of the CoT loop"""
        msgs = await self._create_messages(system_prompt, user_prompt_template)

        yield_answer = False
        cot_step = default_cot_step

        async for (
            is_answer,
            current_step,
            agent_response,
        ) in self._process_agent_response(msgs, loop_count == 1, sp, node_trace):
            if agent_response:
                yield False, False, agent_response
            yield_answer = is_answer
            cot_step = current_step

        if yield_answer:
            yield True, False, None
            return

        if cot_step.finished_cot:
            async for agent_response in self._handle_finished_cot(
                cot_step, sp, node_trace
            ):
                yield False, False, agent_response
            yield True, False, None
            return

        if cot_step.empty:
            raise cot_exc.CotFormatIncorrectExc

        plugin = await self.get_plugin(cot_step)
        cot_step.plugin = plugin

        async for agent_response in self._handle_plugin_execution(
            cot_step, plugin, sp, span
        ):
            yield False, False, agent_response

        if not cot_step.action_output:
            yield True, False, None
            return

        self.scratchpad.steps.append(cot_step)  # pylint: disable=no-member
        yield False, True, None

    async def run(
        self, span: Span, node_trace: NodeTrace
    ) -> AsyncIterator[AgentResponse]:
        """CoT run"""

        with span.start("RunCotAgent") as sp:
            system_prompt = await self.create_system_prompt()
            user_prompt_template = await self.create_user_prompt()

            loop_count = 0
            while self.max_loop > loop_count:
                loop_count += 1

                should_return = False
                should_continue = False

                async for (
                    return_flag,
                    continue_flag,
                    agent_response,
                ) in self._run_single_loop(
                    loop_count,
                    system_prompt,
                    user_prompt_template,
                    sp,
                    node_trace,
                    span,
                ):
                    if agent_response:
                        yield agent_response
                    if return_flag:
                        should_return = True
                    if continue_flag:
                        should_continue = True

                if should_return:
                    return
                if not should_continue:
                    break

            async for agent_response in self.process_runner.run(
                self.scratchpad, sp, node_trace
            ):
                yield agent_response

    async def run_plugin(self, cot_step: CotStep, span: Span) -> PluginResponse:

        with span.start("RunPlugin") as sp:
            plugin_response: PluginResponse

            for plugin in self.plugins:
                if plugin.name.strip() == cot_step.action.strip():
                    sp.add_info_events({"plugin-type": plugin.typ})
                    plugin_response = await plugin.run(cot_step.action_input, sp)
                    break
            else:
                default_result = {
                    "code": 400,
                    "message": f"{cot_step.action} not found",
                    "data": None,
                }

                plugin_response = PluginResponse(
                    result=default_result,
                    log=[
                        {
                            "name": cot_step.action,
                            "input": cot_step.action_input,
                            "output": default_result,
                            "detail": "not found plugin",
                        }
                    ],
                )

            sp.add_info_events({"plugin-result": plugin_response.model_dump_json()})

            return plugin_response

    async def run_workflow_plugin(
        self, plugin: BasePlugin, cot_step: CotStep, span: Span
    ) -> AsyncIterator[AgentResponse]:

        with span.start("RunWorkflowPlugin") as sp:

            cot_step.tool_type = "workflow"

            sp.add_info_events({"plugin-type": "workflow"})
            first_frame = True
            async for plugin_response in plugin.run(
                action_input=cot_step.action_input, span=sp
            ):
                if first_frame:
                    first_frame = False
                    if plugin.run_result is not None:
                        plugin.run_result = plugin_response
                    cot_step.action_output = plugin_response.result
                    yield AgentResponse(
                        typ="cot_step", content=cot_step, model=self.model.name
                    )
                sp.add_info_events({"flow-chunk": plugin_response.model_dump_json()})

                if plugin_response.code != 0:
                    cot_step.action_output = plugin_response.result
                    return
                # yield AgentResponse(typ="log", content=plugin_response.log,
                #                     model=self.model.name)
                if plugin_response.result.get("reasoning_content"):
                    yield AgentResponse(
                        typ="reasoning_content",
                        content=plugin_response.result["reasoning_content"],
                        model=self.model.name,
                    )
                if plugin_response.result.get("content"):
                    yield AgentResponse(
                        typ="content",
                        content=plugin_response.result["content"],
                        model=self.model.name,
                    )

    async def is_valid_plugin(self, plugin_name: str) -> bool:
        for plugin in self.plugins:
            if plugin.name.strip() == plugin_name.strip():
                return True
        return False

    async def get_plugin(self, co_step: CotStep) -> Union[BasePlugin, None]:
        for plugin in self.plugins:
            if plugin.name.strip() == co_step.action.strip():
                return plugin
        return None
