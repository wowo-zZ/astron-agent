import React, {
  useMemo,
  useCallback,
  useRef,
  useState,
  useEffect,
  memo,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Drawer, Button } from 'antd';
import { cloneDeep } from 'lodash';
import { v4 as uuid } from 'uuid';
import useFlowsManager from '@/components/workflow/store/useFlowsManager';
import useFlowStore from '@/components/workflow/store/useFlowStore';
import {
  buildFlowAPI,
  getInputsType,
  saveDialogueAPI,
  getDialogueAPI,
  workflowDialogClear,
  addComparisons,
  workflowDeleteComparisons,
} from '@/services/flow';
import { nextQuestionAdvice } from '@/services/common';
import { isJSON } from '@/utils';
import {
  validateInputJSON,
  generateDefaultInput,
  generateValidationSchema,
  generateInputsAndOutputsOrder,
} from '@/components/workflow/utils/reactflowUtils';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import DeleteChatHistory from '@/components/workflow/modal/delete-chat-history';
import ChatContent from './components/chat-content';
import ChatInput from './components/chat-input';
// import useChat from '@/hooks/useChat';
import { getPublicResult } from '@/services/common';

// 类型导入
import {
  FlowType,
  StartNodeType,
  InterruptChatType,
  ChatInfoType,
  ChatListItem,
  ChatDebuggerAdvancedConfig,
  FlowResultType,
  ChatDebuggerContentProps,
  WebSocketMessageData,
  ReactFlowNode,
  ReactFlowEdge,
} from '@/components/workflow/types';

// 从统一的图标管理中导入
import { Icons } from '@/components/workflow/icons';

// 获取 Chat Debugger 模块的图标
const icons = Icons.chatDebugger;

const initInterruptChat: InterruptChatType = {
  eventId: '',
  interrupt: false,
  nodeId: '',
  type: '',
  option: null,
  needReply: true,
};

const initChatInfo: ChatInfoType = {
  question: [],
  answer: {
    messageContent: '',
    reasoningContent: '',
    content: '',
  },
  answerItem: '',
  option: null,
};

export function ChatDebuggerContent({
  open,
  setOpen,
}: ChatDebuggerContentProps): React.ReactElement {
  const { t } = useTranslation();
  const versionId = useRef<string>('');
  const buildPassRef = useRef<boolean>(false);
  const textareRef = useRef<HTMLTextAreaElement>(null);
  const chatIdRef = useRef<string>(uuid().replace(/-/g, ''));
  const currentFollowNodeId = useRef<string>('');
  const controllerRef = useRef<AbortController | null>(null);
  const isMounted = useRef<boolean>(false);
  const wsMessageStatus = useRef<string | null>(null);
  const messageNodeTextQueue = useRef<string>('');
  const endNodeReasoningTextQueue = useRef<string>('');
  const endNodeTextQueue = useRef<string>('');
  const preRunningNodeIds = useRef<string[]>([]);
  const chatInfoRef = useRef<ChatInfoType>(cloneDeep(initChatInfo));
  const flowResult = useFlowsManager(state => state.flowResult);
  const errNodes = useFlowsManager(state => state.errNodes);
  const currentFlow = useFlowsManager(state => state.currentFlow) as
    | FlowType
    | undefined;
  const currentStore = useFlowsManager(state => state.getCurrentStore());
  const setFlowResult = useFlowsManager(state => state.setFlowResult);
  const setCanPublish = useFlowsManager(state => state.setCanPublish);
  const autonomousMode = useFlowsManager(state => state.autonomousMode);
  const setShowNodeList = useFlowsManager(state => state.setShowNodeList);
  const setCanvasesDisabled = useFlowsManager(
    state => state.setCanvasesDisabled
  );
  const historyVersion = useFlowsManager(state => state.historyVersion);
  const historyVersionData = useFlowsManager(state => state.historyVersionData);
  const nodes = useFlowStore(state => state.nodes);
  const edges = useFlowStore(state => state.edges);
  const moveToPosition = currentStore(state => state.moveToPosition);
  const setNode = useFlowStore(state => state.setNode);
  const setNodes = useFlowStore(state => state.setNodes);
  const setEdges = useFlowStore(state => state.setEdges);
  const [startNodeParams, setStartNodeParams] = useState<StartNodeType[]>([]);
  const [chatList, setChatList] = useState<ChatListItem[]>([]);
  const [debuggering, setDebuggering] = useState<boolean>(false);
  const [userWheel, setUserWheel] = useState<boolean>(false);
  const [deleteAllModal, setDeleteAllModal] = useState<boolean>(false);
  const [suggestLoading, setSuggestLoading] = useState<boolean>(false);
  const [suggestProblem, setSuggestProblem] = useState<string[]>([]);
  const [interruptChat, setInterruptChat] = useState<InterruptChatType>({
    ...initInterruptChat,
  });
  const [showChatDebuggerPage, setShowChatDebuggerPage] =
    useState<boolean>(true);

  useEffect(() => {
    if (!flowResult?.status) {
      controllerRef?.current?.abort();
      handleWorkflowDeleteComparisons();
      wsMessageStatus.current = 'end';
      setInterruptChat({ ...initInterruptChat });

      setNodes(old => {
        old.forEach(node => (node.data.status = ''));
        return cloneDeep(old);
      });
      setEdges(edges =>
        edges?.map(edge => ({
          ...edge,
          animated: false,
          style: {
            stroke: '#275EFF',
            strokeWidth: 2,
          },
        }))
      );
    }
  }, [flowResult?.status, currentFlow?.flowId]);

  const advancedConfig = useMemo<ChatDebuggerAdvancedConfig>(() => {
    if (currentFlow?.advancedConfig && isJSON(currentFlow.advancedConfig)) {
      const parsedConfig = JSON.parse(currentFlow.advancedConfig);
      return {
        suggestedQuestionsAfterAnswer: {
          enabled: parsedConfig?.suggestedQuestionsAfterAnswer?.enabled ?? true,
        },
      };
    } else {
      return {
        suggestedQuestionsAfterAnswer: {
          enabled: true,
        },
      };
    }
  }, [currentFlow?.advancedConfig]);

  const getDialogues = useCallback(
    (id: string, shouldAddDivider = false): void => {
      getDialogueAPI(id, 1).then((data: unknown[]) => {
        const chatList: ChatListItem[] = [];
        let chatId = data?.[0]?.chatId || null;
        data?.forEach(chat => {
          const currentChatId = chat?.chatId;
          if (currentChatId !== chatId) {
            chatList.unshift({
              id: uuid(),
              type: 'divider',
            });
          }

          chatList.unshift({
            ...chat,
            id: chat?.id,
            type: 'answer',
            messageContent: JSON.parse(chat?.answer)?.messageContent || '',
            reasoningContent: JSON.parse(chat?.answer)?.reasoningContent || '',
            content: JSON.parse(chat?.answer)?.content || '',
            option: JSON.parse(chat?.answer)?.option,
          });
          chatList.unshift({
            ...chat,
            id: uuid(),
            type: 'ask',
            inputs: JSON.parse(chat?.question),
          });
          chatId = currentChatId;
        });
        if (shouldAddDivider && data.length !== 0) {
          chatList.push({
            id: uuid(),
            type: 'divider',
          });
        }
        setChatList(chatList);
      });
    },
    []
  );

  useEffect(() => {
    currentFlow?.id && getDialogues(currentFlow?.id, true);
  }, [currentFlow?.id]);

  useEffect(() => {
    const handleBeforeUnload = (): void => {
      controllerRef?.current?.abort();
      handleWorkflowDeleteComparisons();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return (): void => {
      clearNodeStatus();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleWorkflowDeleteComparisons();
      controllerRef?.current?.abort();
    };
  }, [currentFlow?.flowId]);

  const handleWorkflowDeleteComparisons = useCallback(() => {
    if (!versionId?.current) return;
    const parmas = {
      flowId: currentFlow?.flowId,
      version: versionId.current,
    };
    workflowDeleteComparisons(parmas);
  }, [currentFlow?.flowId]);

  const handleMoveToPosition = useCallback(
    (id: string, nodes: ReactFlowNode[]): void => {
      const currentNode = nodes.find((node: ReactFlowNode) => node.id === id);
      const zoom = 0.8;
      const xPos = currentNode?.position?.x || 0;
      const yPos = currentNode?.position?.y || 0;
      moveToPosition({ x: -xPos * zoom + 200, y: -yPos * zoom + 200, zoom });
    },
    [moveToPosition]
  );

  const startNode = useMemo(() => {
    return nodes?.find((node: ReactFlowNode) => node.nodeType === 'node-start');
  }, [nodes]);

  useEffect(() => {
    open &&
      setStartNodeParams(
        startNode?.data?.outputs?.map(input => {
          const errorMsg =
            input?.schema?.type === 'object'
              ? validateInputJSON('{}', generateValidationSchema(input))
              : '';
          const allowedFileType = input?.allowedFileType?.[0];
          return {
            name: input.name,
            type: input?.schema?.type,
            allowedFileType: allowedFileType,
            fileType: input?.fileType,
            default: allowedFileType
              ? []
              : input?.schema?.type === 'object'
                ? '{}'
                : input?.schema?.type.includes('array')
                  ? '[]'
                  : generateDefaultInput(input?.schema?.type),
            description: input?.schema?.default,
            required: input?.required,
            validationSchema:
              input?.schema?.type === 'object' ||
              (input?.schema?.type.includes('array') && !input?.fileType)
                ? generateValidationSchema(input)
                : null,
            errorMsg: errorMsg,
            originErrorMsg: errorMsg,
          };
        }) || []
      );
  }, [startNode, open]);

  const trialRun = useMemo(() => {
    return errNodes?.length === 0;
  }, [errNodes]);

  const pushAskToChatList = useCallback(
    (inputs, nodes, nodeId): void => {
      setChatList(chatList => {
        const newInputs = inputs || cloneDeep(startNodeParams);
        const askParams: ChatListItem = {
          id: uuid(),
          type: 'ask',
          inputs: newInputs,
        };
        chatInfoRef.current.question = newInputs;
        chatList.push(askParams);
        return [...chatList];
      });
      handleMoveToPosition(nodeId, nodes);
    },
    [startNodeParams, setChatList]
  );

  const pushAnswerToChatList = useCallback(() => {
    setChatList(chatList => {
      const answerParams: ChatListItem = {
        id: uuid(),
        type: 'answer',
        messageContent: '',
        content: '',
        reasoningContent: '',
      };
      chatList.push(answerParams);
      return [...chatList];
    });
  }, [setChatList]);

  const pushContentToAnswer = useCallback(
    (key, content): void => {
      const queue =
        key === 'messageContent'
          ? messageNodeTextQueue
          : key === 'reasoningContent'
            ? endNodeReasoningTextQueue
            : endNodeTextQueue;
      queue.current = queue.current + content;
    },
    [chatList, setChatList]
  );

  const clearNodeStatus = useCallback(() => {
    chatInfoRef.current = cloneDeep(initChatInfo);
    if (textareRef.current) {
      textareRef.current.value = '';
    }
    //@ts-ignore
    setStartNodeParams(startNodeParams =>
      startNodeParams?.map(input => ({
        ...input,
        errorMsg: input?.originErrorMsg,
        default: input?.fileType
          ? []
          : input?.type === 'object'
            ? '{}'
            : input?.type?.includes('array')
              ? '[]'
              : generateDefaultInput(input?.type),
      }))
    );
  }, [setStartNodeParams]);

  const handleSaveDialogue = useCallback(() => {
    const params = {
      chatId: chatIdRef.current,
      type: 1,
      workflowId: currentFlow?.id,
      sid: chatInfoRef?.current?.sid,
      questionItem: JSON.stringify(chatInfoRef?.current?.question),
      answerItem: JSON.stringify(chatInfoRef?.current?.answerItem),
      question: JSON.stringify(chatInfoRef?.current?.question),
      answer: JSON.stringify(chatInfoRef?.current?.answer),
    };
    saveDialogueAPI(params).then(
      () => currentFlow?.id && getDialogues(currentFlow.id)
    );
  }, [currentFlow, nodes, edges]);

  const handleSynchronizeDataToXfyun = useCallback(() => {
    const botId = isJSON(currentFlow?.ext)
      ? JSON.parse(currentFlow?.ext)?.botId
      : '';
    const params = {
      botId,
    };
    getInputsType(params);
  }, [currentFlow]);

  const handleMessageEnd = useCallback(
    (data: WebSocketMessageData) => {
      const flowResult: FlowResultType = {
        status: data.code === 0 ? 'success' : 'failed',
        timeCost: (data?.executedTime || 0).toString(),
        totalTokens: (data?.usage?.['total_tokens'] || 0).toString(),
      };
      wsMessageStatus.current = 'end';
      setShowNodeList(true);
      setFlowResult(flowResult);
      setEdges(edges =>
        edges?.map(edge => ({
          ...edge,
          animated: false,
          style: {
            stroke: '#275EFF',
            strokeWidth: 2,
          },
        }))
      );
      !historyVersion && setCanvasesDisabled(false);
      setInterruptChat({ ...initInterruptChat });
      handleRunningNodeStatus();
    },
    [startNodeParams, setDebuggering, autonomousMode, nodes, edges]
  );

  const handleMessage = useCallback(
    (nodes: ReactFlowNode[], edges: ReactFlowEdge[], e: MessageEvent) => {
      if (e.data && isJSON(e.data)) {
        const data: WebSocketMessageData = JSON.parse(e.data);
        const flowResult = data.choices?.[0]?.['finish_reason'];
        const node = data?.['workflow_step']?.node;
        const nodeId = node?.id;
        const nodeStatus = node?.['finish_reason'];
        const content = data.choices?.[0]?.delta?.content;
        const responseResult = {
          timeCost: node?.['executed_time'],
          tokenCost: node?.usage?.['total_tokens'],
          inputs: node?.inputs,
          outputs: node?.outputs,
          errorOutputs: node?.['error_outputs'],
          rawOutput: node?.ext?.['raw_output'],
          nodeAnswerContent: content,
          reasoningContent:
            data?.choices?.[0]?.delta?.['reasoning_content'] || '',
          status: data?.code === 0 ? 'success' : 'failed',
          failedReason: data?.message,
          answerMode: node?.id?.startsWith('message')
            ? 1
            : node?.ext?.['answer_mode'],
        };
        chatInfoRef.current.sid = data?.id;
        if (data?.code === 21103) {
          //审核不通过
          messageNodeTextQueue.current = '';
          endNodeReasoningTextQueue.current = '';
          endNodeTextQueue.current = '';
          setChatList(chatList => {
            chatInfoRef.current.answer = {
              messageContent: '',
              reasoningContent: '',
              content: data?.message,
            };
            chatList[chatList.length - 1].messageContent = '';
            chatList[chatList.length - 1].reasoningContent = '';
            chatList[chatList.length - 1].content = data?.message;
            return [...chatList];
          });
          handleMessageEnd(data);
        } else if (flowResult === null && nodeId !== 'flow_obj') {
          handleNodeStatusChange(
            nodes,
            edges,
            nodeId,
            nodeStatus === null ? 'ing' : nodeStatus,
            responseResult
          );
        } else if (flowResult === 'interrupt') {
          const content = data?.['event_data']?.value?.content;
          handleNodeStatusChange(
            nodes,
            edges,
            nodeId,
            nodeStatus,
            responseResult
          );
          pushContentToAnswer('content', content);
          wsMessageStatus.current = 'end';
          setInterruptChat({
            interrupt: true,
            eventId: data?.['event_data']?.event_id || '',
            nodeId: nodeId || '',
            option:
              data?.['event_data']?.value?.option?.filter(
                item => item.id !== 'default'
              ) || null,
            type: data?.['event_data']?.value?.type || '',
            needReply: data?.['event_data']?.need_reply || false,
          });
          chatInfoRef.current.answer.option = data?.[
            'event_data'
          ]?.value?.option?.filter(item => item.id !== 'default');
        } else if (flowResult === 'stop') {
          if (data.code !== 0) {
            pushContentToAnswer('content', data?.message);
          }
          handleMessageEnd(data);
        }
      }
    },
    [startNodeParams, setDebuggering, autonomousMode]
  );

  const handleResumeChat = useCallback(
    (content): void => {
      wsMessageStatus.current = 'start';
      setDebuggering(true);
      pushAskToChatList(
        [
          {
            name: 'AGENT_USER_INPUT',
            type: 'string',
            default:
              content || t('workflow.nodes.chatDebugger.userIgnoredQuestion'),
            description: t('workflow.nodes.chatDebugger.userCurrentRoundInput'),
            required: true,
            validationSchema: null,
            errorMsg: '',
            originErrorMsg: '',
          },
        ],
        nodes,
        interruptChat?.nodeId
      );
      pushAnswerToChatList();
      clearNodeStatus();
      const url = 'http://172.29.201.92:8080/workflow/resume';
      const latestAccessToken = localStorage.getItem('accessToken');
      const params = {
        flow_id: currentFlow?.flowId,
        eventId: interruptChat?.eventId,
        eventType: content ? 'resume' : 'ignore',
        content,
      };
      if (versionId.current) {
        params.version = versionId.current;
        params.promptDebugger = true;
      }
      fetchEventSource(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + latestAccessToken,
        },
        body: JSON.stringify(params),
        signal: controllerRef?.current?.signal,
        openWhenHidden: true,
        onerror() {
          controllerRef?.current?.abort();
        },
        onmessage(e) {
          handleMessage(nodes, edges, e);
        },
      });
    },
    [nodes, interruptChat]
  );

  const handleRunDebugger = useCallback(
    (nodes, edges, inputs?, regen = false): void => {
      if (
        advancedConfig?.suggestedQuestionsAfterAnswer?.enabled &&
        startNodeParams?.length === 1
      ) {
        setSuggestLoading(true);
        nextQuestionAdvice({
          question: inputs?.[0]?.default || startNodeParams?.[0]?.default,
        })
          .then(data => {
            setSuggestProblem(() => data);
          })
          .finally(() => setSuggestLoading(false));
      } else {
        setSuggestProblem(() => []);
      }
      buildPassRef.current = false;
      let params = {};
      let api: ((params: unknown) => Promise<unknown>) | null = null;
      if (historyVersion) {
        versionId.current = uuid();
        params = {
          flowId: currentFlow?.flowId,
          name: currentFlow?.name,
          data: {
            nodes: nodes?.map(({ nodeType, ...reset }) => ({
              ...reset,
              data: {
                ...reset?.data,
                updatable: false,
              },
            })),
            edges: edges?.map(({ style, animated, ...reset }) => reset),
          },
          version: versionId.current,
        };
        api = addComparisons;
      } else {
        params = {
          id: currentFlow?.id,
          flowId: currentFlow?.flowId,
          name: currentFlow?.name,
          description: currentFlow?.description,
          data: {
            nodes: nodes?.map(({ nodeType, ...reset }) => {
              const node = {
                ...reset,
                data: {
                  ...reset?.data,
                  updatable: false,
                },
              };
              Reflect.deleteProperty(node.data, 'debuggerResult');
              return node;
            }),
            edges: edges?.map(({ style, animated, ...reset }) => reset),
          },
        };
        api = buildFlowAPI;
      }
      api(params)
        .then(() => {
          setCanPublish(true);
          setShowNodeList(false);
          preRunningNodeIds.current = [];
          buildPassRef.current = true;
          setFlowResult({
            status: 'running',
            timeCost: '',
            totalTokens: '',
          });
          clearNodeStatus();
          setUserWheel(false);
          pushAskToChatList(inputs, nodes, startNode?.id);
          !historyVersion && setCanvasesDisabled(true);
          pushAnswerToChatList();
          runDebugger(nodes, edges, inputs, regen);
          //同步数据到开放平台
          handleSynchronizeDataToXfyun();
        })
        .catch(() => {
          setDebuggering(false);
          wsMessageStatus.current = 'end';
        });
    },
    [
      currentFlow,
      startNodeParams,
      startNode,
      setDebuggering,
      autonomousMode,
      advancedConfig?.suggestedQuestionsAfterAnswer?.enabled,
    ]
  );

  const handleNodeStatusChange = useCallback(
    (nodes, edges, nodeId, nodeStatus, responseResult): void => {
      const currentNode = nodes.find(node => node.id === nodeId);
      if (nodeId?.startsWith('node-end') && responseResult?.reasoningContent) {
        pushContentToAnswer(
          'reasoningContent',
          responseResult?.reasoningContent
        );
      }
      if (nodeId?.startsWith('message')) {
        pushContentToAnswer(
          'messageContent',
          responseResult?.nodeAnswerContent
        );
      }
      if (nodeId?.startsWith('node-end')) {
        pushContentToAnswer('content', responseResult?.nodeAnswerContent);
      }
      //记录结束节点的原始输出
      if (nodeId?.startsWith('node-end') || nodeId?.startsWith('message')) {
        chatInfoRef.current.answerItem =
          chatInfoRef.current.answerItem + responseResult?.nodeAnswerContent;
      }
      if (nodeStatus === 'ing' || nodeStatus === 'interrupt') {
        currentNode.data.status = 'running';
        const beforeContent = currentNode?.data?.debuggerResult?.done
          ? ''
          : (currentNode?.data?.debuggerResult?.answerContent ?? '');
        const beforeReasoningContent = currentNode?.data?.debuggerResult?.done
          ? ''
          : (currentNode?.data?.debuggerResult?.reasoningContent ?? '');
        currentNode.data.debuggerResult = {
          answerMode: responseResult?.answerMode,
          answerContent: beforeContent + responseResult?.nodeAnswerContent,
          reasoningContent:
            beforeReasoningContent + responseResult?.reasoningContent,
          done: false,
        };
      } else {
        const beforeContent =
          currentNode?.data?.debuggerResult?.answerContent ?? '';
        const beforeReasoningContent =
          currentNode?.data?.debuggerResult?.reasoningContent ?? '';
        currentNode.data.debuggerResult = {
          timeCost: responseResult?.timeCost || undefined,
          tokenCost: responseResult?.timeCost?.totalTokens || undefined,
          input: generateInputsAndOutputsOrder(
            currentNode,
            responseResult.inputs,
            'inputs'
          ),
          rawOutput: responseResult?.rawOutput,
          output: generateInputsAndOutputsOrder(
            currentNode,
            responseResult.outputs,
            'outputs'
          ),
          errorOutputs: responseResult?.errorOutputs,
          failedReason: '',
          answerContent: beforeContent + responseResult?.nodeAnswerContent,
          reasoningContent:
            beforeReasoningContent + responseResult?.reasoningContent,
          answerMode: responseResult?.answerMode,
          done: true,
        };
        if (responseResult.status === 'success') {
          currentNode.data.status = 'success';
        } else {
          currentNode.data.status = 'failed';
          currentNode.data.debuggerResult.failedReason =
            responseResult?.failedReason;
        }
        if (
          nodeId?.startsWith('node-end') &&
          responseResult?.answerMode === 0
        ) {
          pushContentToAnswer(
            'content',
            JSON.stringify(responseResult?.outputs)
          );
          chatInfoRef.current.answerItem = JSON.stringify(
            responseResult?.outputs
          );
        }
        if (nodeId?.startsWith('message')) {
          pushContentToAnswer('messageContent', '\n');
        }
      }
      if (preRunningNodeIds?.current?.length > 0) {
        const sourceNodesId = edges
          ?.filter(edge => edge?.target === currentNode?.id)
          ?.map(edge => edge?.source);
        const set2 = new Set(sourceNodesId);
        const intersectionIds = preRunningNodeIds?.current.filter(value =>
          set2.has(value)
        );
        setEdges(edges => {
          edges.forEach(edge => {
            if (
              edge.target === currentNode?.id &&
              intersectionIds?.includes(edge.source)
            ) {
              edge.animated = true;
              edge.style = {
                stroke: '#275EFF',
                strokeWidth: 2,
                strokeDasharray: '5 5',
              };
            }
          });
          return cloneDeep(edges);
        });
      }
      setNode(nodeId, cloneDeep(currentNode));
      preRunningNodeIds.current.push(currentNode?.id);
      //跟随模式下需要根据节点移动画布
      if (currentNode?.id?.startsWith('node-start')) {
        currentFollowNodeId.current = currentNode?.id;
      }
      if (!autonomousMode) {
        const shouldMoveNode = edges?.some(
          edge =>
            edge?.source === currentFollowNodeId?.current &&
            edge?.target === currentNode?.id
        );
        if (shouldMoveNode && currentNode?.id) {
          handleMoveToPosition(currentNode?.id, nodes);
          currentFollowNodeId.current = currentNode?.id;
        }
      }
    },
    [autonomousMode]
  );

  //flow运行结束修改尚在运行中得节点为cancel态
  const handleRunningNodeStatus = useCallback(() => {
    setNodes(nodes => {
      nodes.forEach(node => {
        if (node?.data?.status === 'running') {
          node.data.debuggerResult.cancelReason = t(
            'workflow.nodes.chatDebugger.workflowTerminated'
          );
          node.data.status = 'cancel';
        }
      });
      return cloneDeep(nodes);
    });
  }, []);

  const runDebugger = useCallback(
    (nodes, edges, enters?, regen = false): void => {
      const url = 'http://172.29.201.92:8080/workflow/chat';
      controllerRef.current = new AbortController();
      const inputs = {};
      const enterlist = enters ?? startNodeParams;
      enterlist.forEach(params => {
        if (
          params.type === 'object' ||
          (!params.fileType && params.type.includes('array'))
        ) {
          inputs[params.name] =
            isJSON(params.default as string) &&
            JSON.parse(params.default as string);
        } else if (params.fileType && params.type === 'string') {
          inputs[params.name] = params.default?.[0]?.url;
        } else if (params.fileType && params.type === 'array-string') {
          inputs[params.name] = params.default?.map(item => item?.url);
        } else {
          inputs[params.name] = params.default;
        }
      });
      const params = {
        flow_id: currentFlow?.flowId,
        inputs: inputs,
        chatId: chatIdRef.current,
        regen,
      };
      const latestAccessToken = localStorage.getItem('accessToken');
      if (historyVersion) {
        params.version = versionId.current;
        params.promptDebugger = true;
      }
      fetchEventSource(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + latestAccessToken,
        },
        body: JSON.stringify(params),
        signal: controllerRef?.current?.signal,
        openWhenHidden: true,
        onerror() {
          controllerRef?.current?.abort();
        },
        onmessage(e) {
          handleMessage(nodes, edges, e);
        },
      });
    },
    [startNodeParams, setDebuggering, autonomousMode]
  );

  const canRunDebugger = useMemo(() => {
    if (!debuggering && interruptChat?.type === 'option') return false;
    if (
      !debuggering &&
      startNodeParams?.length > 1 &&
      startNodeParams.every((params: StartNodeType) => {
        if (params?.required) {
          if (params.errorMsg) {
            return false;
          } else if (params.fileType) {
            return params?.default?.length > 0;
          } else if (
            params.type === 'object' ||
            params.type.includes('array')
          ) {
            return isJSON(params?.default as string);
          } else if (params.type === 'string') {
            return (params?.default as string)?.trim();
          } else if (params.type === 'boolean') {
            return typeof params?.default === 'boolean';
          } else {
            return typeof params?.default !== 'string';
          }
        } else if (params.fileType) {
          return params?.default?.every(item => !item?.loading);
        } else {
          return true;
        }
      })
    ) {
      return true;
    }
    if (
      !debuggering &&
      startNodeParams?.length === 1 &&
      textareRef?.current?.value?.trim()
    ) {
      return true;
    }
    return false;
  }, [debuggering, startNodeParams, interruptChat]);

  const clearData = useCallback(() => {
    preRunningNodeIds.current = [];
    setStartNodeParams([]);
    if (textareRef.current) {
      textareRef.current.value = '';
    }
    setOpen(false);
    if (debuggering) {
      setFlowResult({
        status: '',
        timeCost: '',
        totalTokens: '',
      });
    }
    setShowNodeList(true);
    setCanvasesDisabled(false);
  }, [debuggering]);

  const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    e.stopPropagation();
    if (
      e.nativeEvent.keyCode === 13 &&
      !e.nativeEvent.shiftKey &&
      canRunDebugger
    ) {
      e.preventDefault();
      if (interruptChat?.interrupt) {
        handleResumeChat(textareRef?.current?.value);
      } else {
        const { nodes, edges } = resetNodesAndEdges();
        handleRunDebugger(nodes, edges, [
          {
            name: 'AGENT_USER_INPUT',
            type: 'string',
            default: textareRef?.current?.value,
            description: t('workflow.nodes.chatDebugger.userCurrentRoundInput'),
            required: true,
            validationSchema: null,
            errorMsg: '',
            originErrorMsg: '',
          },
        ]);
      }
    } else if (e.nativeEvent.keyCode === 13 && !e.nativeEvent.shiftKey) {
      e.preventDefault();
    } else if (e.key === 'Tab') {
      startNodeParams[0].default = startNodeParams[0].default + '\t';
      textareRef.current.value = textareRef?.current?.value + '\t';
      setStartNodeParams([...startNodeParams]);
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (isMounted.current) {
      !debuggering && buildPassRef.current && handleSaveDialogue();
    } else {
      isMounted.current = true;
    }
  }, [debuggering]);

  const resetNodesAndEdges = useCallback((): {
    nodes: ReactFlowNode[];
    edges: ReactFlowEdge[];
  } => {
    wsMessageStatus.current = 'start';
    setDebuggering(true);
    const newNodes = cloneDeep(nodes);
    newNodes.forEach(node => {
      node.data.status = '';
      node.data.debuggerResult = {};
    });
    setNodes(newNodes);
    return {
      nodes: newNodes,
      edges: edges,
    };
  }, [nodes, edges, setNodes]);

  const deleteAllChat = useCallback((): void => {
    workflowDialogClear(currentFlow?.id, 1).then(() => {
      chatIdRef.current = uuid().replace(/-/g, '');
      setDeleteAllModal(false);
      setChatList([]);
      setInterruptChat({ ...initInterruptChat });
      !historyVersion && setCanvasesDisabled(false);
    });
  }, [currentFlow, setDeleteAllModal, setChatList]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    if (debuggering) {
      timer = setInterval((): void => {
        const queue = messageNodeTextQueue?.current
          ? messageNodeTextQueue
          : endNodeReasoningTextQueue?.current
            ? endNodeReasoningTextQueue
            : endNodeTextQueue;
        const contentKey = messageNodeTextQueue?.current
          ? 'messageContent'
          : endNodeReasoningTextQueue?.current
            ? 'reasoningContent'
            : 'content';
        const value = queue.current.slice(0, 10);
        if (value) {
          queue.current = queue.current.slice(10);
          setChatList(chatList => {
            chatInfoRef.current.answer[contentKey] =
              chatInfoRef.current.answer[contentKey] + value;
            chatList[chatList.length - 1][contentKey] =
              chatList[chatList.length - 1][contentKey] + value;
            return [...chatList];
          });
        }
        if (
          !messageNodeTextQueue.current &&
          !endNodeReasoningTextQueue.current &&
          !endNodeTextQueue.current &&
          wsMessageStatus.current === 'end'
        ) {
          setDebuggering(false);
          setChatList(chatList => {
            if (chatList[chatList.length - 1]) {
              chatList[chatList.length - 1].showResponse = true;
              if (interruptChat?.type === 'option') {
                chatList[chatList.length - 1].option = interruptChat?.option;
              }
            }
            return [...chatList];
          });
        }
      }, 10);
    } else {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    return (): void => clearInterval(timer);
  }, [debuggering, chatList, interruptChat]);

  const xfYunBot = useMemo(() => {
    return isJSON(currentFlow?.ext) ? JSON.parse(currentFlow?.ext) : {};
  }, [currentFlow]);

  const handleStopConversation = useCallback((): void => {
    chatIdRef.current = uuid().replace(/-/g, '');
    if (interruptChat?.interrupt) {
      const url = 'http://172.29.201.92:8080/workflow/resume';
      const params = {
        flow_id: currentFlow?.flowId,
        eventId: interruptChat?.eventId,
        eventType: 'abort',
      };
      const latestAccessToken = localStorage.getItem('accessToken');
      fetchEventSource(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + latestAccessToken,
        },
        body: JSON.stringify(params),
        signal: controllerRef?.current?.signal,
        openWhenHidden: true,
        onerror() {
          controllerRef?.current?.abort();
        },
      });
    }
    setChatList(chatList => [
      ...chatList,
      {
        id: uuid(),
        type: 'divider',
      },
    ]);
    setInterruptChat({ ...initInterruptChat });
    !historyVersion && setCanvasesDisabled(false);
    setShowNodeList(true);
    setEdges(edges =>
      edges?.map(edge => ({
        ...edge,
        animated: false,
        style: {
          stroke: '#275EFF',
          strokeWidth: 2,
        },
      }))
    );
    setFlowResult({
      status: '',
      timeCost: '',
      totalTokens: '',
    });
  }, [interruptChat, currentFlow]);

  const multiParams = useMemo((): boolean => {
    const startNode = nodes?.find(node => node?.nodeType === 'node-start');
    const outputs = startNode?.data?.outputs;
    let multiParams = true;
    if (outputs?.length === 1) {
      multiParams = false;
    }
    if (
      outputs?.length === 2 &&
      outputs?.[1]?.fileType &&
      outputs?.[1]?.schema?.type === 'string'
    ) {
      multiParams = false;
    }
    return multiParams;
  }, [nodes]);

  useEffect(() => {
    if (historyVersion && historyVersionData?.name) {
      const params = {
        flowId: currentFlow?.flowId,
        name: historyVersionData?.name,
      };
      getPublicResult(params)
        .then(data => {
          setShowChatDebuggerPage(
            data?.some(item => item?.publishResult === '成功')
          );
        })
        .catch(error => {
          console.error('获取发布结果详情失败:', error);
        });
    }
  }, [historyVersion, historyVersionData, currentFlow?.flowId]);

  return (
    <div
      className="w-full h-full py-4 flex flex-col overflow-hidden"
      tabIndex={0}
      onKeyDown={e => e.stopPropagation()}
    >
      {deleteAllModal && (
        <DeleteChatHistory
          setDeleteModal={setDeleteAllModal}
          deleteChat={deleteAllChat}
        />
      )}
      <div className="flex items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-lg">
            {trialRun
              ? t('workflow.nodes.chatDebugger.dialogue')
              : t('workflow.nodes.chatDebugger.runResult')}
          </span>
        </div>
        <img
          src={icons.close}
          className="w-3 h-3 cursor-pointer"
          alt=""
          onClick={() => clearData()}
        />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden mt-1">
        <div className="w-full flex items-center justify-between px-5">
          <div className="flex items-center gap-2 text-desc">
            <img src={icons.chatListTip} className="w-3 h-3 mt-0.5" alt="" />
            <span>
              {t('workflow.nodes.chatDebugger.keepOnly10DialogueRecords')}
            </span>
          </div>
          {multiParams ? (
            <div className="text-[#ff9a27] text-sm">
              {t(
                'workflow.nodes.chatDebugger.multiParamWorkflowOnlySupportDebugAndPublishAsAPI'
              )}
            </div>
          ) : !showChatDebuggerPage ? (
            <div className="text-[#ff9a27] text-sm">
              当前版本未发布成功，无用户对话页
            </div>
          ) : (
            <div
              className="flex items-center gap-2 font-medium cursor-pointer"
              onClick={() => {
                const params = {
                  chatId: xfYunBot?.chatId,
                  botId: xfYunBot?.botId,
                };
                if (historyVersion) {
                  params.version = historyVersionData?.name;
                } else {
                  params.version = 'debugger';
                }
                // handleFlowToChat(params);
              }}
            >
              <img
                src={icons.switchUserChatPageActive}
                className="w-[18px] h-[18px]"
                alt=""
              />
              <span className="text-[#275EFF]">
                {t('workflow.nodes.chatDebugger.switchToUserDialoguePage')}
              </span>
            </div>
          )}
        </div>
        <ChatContent
          open={open}
          userWheel={userWheel}
          setUserWheel={setUserWheel}
          chatList={chatList}
          setChatList={setChatList}
          startNodeParams={startNodeParams}
          resetNodesAndEdges={resetNodesAndEdges}
          handleRunDebugger={handleRunDebugger}
          debuggering={debuggering}
          suggestProblem={suggestProblem}
          suggestLoading={suggestLoading}
          needReply={interruptChat?.needReply}
          handleResumeChat={handleResumeChat}
          handleStopConversation={handleStopConversation}
        />
        <ChatInput
          interruptChat={interruptChat}
          startNodeParams={startNodeParams}
          setStartNodeParams={setStartNodeParams}
          textareRef={textareRef}
          handleEnterKey={handleEnterKey}
        />
      </div>
      {trialRun && (
        <div className="flex items-center justify-between mt-4 px-5">
          {!debuggering ? (
            <Button
              type="text"
              className="origin-btn px-[26px]"
              onClick={() => setDeleteAllModal(true)}
            >
              {t('workflow.nodes.chatDebugger.clearDialogue')}
            </Button>
          ) : (
            <div className="h-1"></div>
          )}
          <div className="flex items-center gap-2.5">
            <Button
              type="text"
              className="origin-btn px-[24px]"
              onClick={() => clearData()}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="primary"
              className="px-[24px] flex items-center gap-2"
              onClick={() => {
                if (startNodeParams?.length === 1 || interruptChat?.interrupt) {
                  if (interruptChat?.interrupt) {
                    handleResumeChat(textareRef?.current?.value);
                  } else {
                    const { nodes, edges } = resetNodesAndEdges();
                    handleRunDebugger(nodes, edges, [
                      {
                        name: 'AGENT_USER_INPUT',
                        type: 'string',
                        default: textareRef?.current?.value,
                        description: t(
                          'workflow.nodes.chatDebugger.userCurrentRoundInput'
                        ),
                        required: true,
                        validationSchema: null,
                        errorMsg: '',
                        originErrorMsg: '',
                      },
                    ]);
                  }
                } else {
                  const { nodes, edges } = resetNodesAndEdges();
                  handleRunDebugger(nodes, edges);
                }
              }}
              disabled={!canRunDebugger}
            >
              <img src={icons.trialRun} className="w-3 h-3" alt="" />
              <span>{t('workflow.nodes.chatDebugger.send')}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatDebuggerResult(): React.ReactElement {
  const open = useFlowsManager(state => state.chatDebuggerResult);
  const setOpen = useFlowsManager(state => state.setChatDebuggerResult);

  return (
    <Drawer
      rootClassName="operation-result-container"
      placement="right"
      open={open}
      mask={false}
      destroyOnClose
    >
      <ChatDebuggerContent open={open} setOpen={setOpen} />
    </Drawer>
  );
}

export default memo(ChatDebuggerResult);
