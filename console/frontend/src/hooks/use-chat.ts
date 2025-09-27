import useChatStore from '@/store/chat-store';
import { getLanguageCode } from '@/utils/http';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useRef } from 'react';
import type { BotInfoType, Option } from '@/types/chat';
import { useNavigate } from 'react-router-dom';

// SSE 数据类型定义
interface SSEData {
  sseId?: string;
  type?: string;
  choices?: Array<{
    delta?: {
      content?: string;
      reasoning_content?: string;
      tool_calls?: Array<{
        deskToolName: string;
      }>;
    };
  }>;
  end?: boolean;
  id?: number;
  workflow_step?: {
    progress?: string;
  };
  content?: string;
  option?: Option[];
  abort?: boolean;
  ignore?: boolean;
  error?: string | boolean;
  message?: string;
}

interface SSEEvent {
  data: string;
}

const useChat = () => {
  const controllerRef = useRef<AbortController>(new AbortController()); //sse请求控制器
  const sidRef = useRef<string>(''); //sid
  const currentChatId = useChatStore(state => state.currentChatId); //当前聊天id
  const workflowOption = useChatStore(state => state.workflowOption); //工作流选项
  const setStreamId = useChatStore(state => state.setStreamId); //对话流id
  const setAnswerPercent = useChatStore(state => state.setAnswerPercent); //进度条
  const setControllerRef = useChatStore(state => state.setControllerRef); //sse请求控制器
  const addMessage = useChatStore(state => state.addMessage); //添加消息
  const startStreamingMessage = useChatStore(
    state => state.startStreamingMessage
  ); //开始流式消息
  const updateStreamingMessage = useChatStore(
    state => state.updateStreamingMessage
  ); //更新流式消息
  const finishStreamingMessage = useChatStore(
    state => state.finishStreamingMessage
  ); //完成流式消息
  const clearStreamingMessage = useChatStore(
    state => state.clearStreamingMessage
  ); //清除流式消息
  const setCurrentToolName = useChatStore(state => state.setCurrentToolName); //当前调用工具名称
  const setTraceSource = useChatStore(state => state.setTraceSource); //溯源结果
  const setDeepThinkText = useChatStore(state => state.setDeepThinkText); //深度思考
  const setIsLoading = useChatStore(state => state.setIsLoading); //是否正在加载
  const setWorkflowOperation = useChatStore(
    state => state.setWorkflowOperation
  ); //工作流操作
  const setIsWorkflowOption = useChatStore(state => state.setIsWorkflowOption); //是否是选项
  const setWorkflowOption = useChatStore(state => state.setWorkflowOption); //工作流选项
  const navigate = useNavigate();
  /**
   *
   * @param url 接口url
   * @param form 表单数据
   * @param token 极验token
   */
  const fetchSSE = async (url: string, form: FormData): Promise<void> => {
    let ans: string = '';
    let nodeChat: boolean = false;
    let nodeChatContent: string = '';
    const controller = new AbortController();
    controllerRef.current = controller;
    setControllerRef(controllerRef.current);
    const headerConfig = {
      'Lang-Code': getLanguageCode(),
      authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    };
    addMessage({
      id: Date.now(),
      message: (() => {
        try {
          const textValue = form.get('text')?.toString() || '{}';
          const parsed = JSON.parse(textValue);
          return parsed?.id || textValue;
        } catch {
          return form.get('text')?.toString() || '';
        }
      })(),
      updateTime: new Date().toISOString(),
      reqId: 'USER',
    });
    // 开始流式消息
    startStreamingMessage({
      id: Date.now() + 1, // 临时ID，完成后会被替换
      message: '',
      reqId: 'BOT',
      updateTime: new Date().toISOString(),
    });
    fetchEventSource(url, {
      method: 'POST',
      body: form,
      headers: {
        ...headerConfig,
      },
      openWhenHidden: true,
      signal: controller.signal,
      onopen(): Promise<void> {
        return Promise.resolve();
      },
      onmessage(event: SSEEvent): void {
        const deCodedData: SSEData = JSON.parse(event.data);
        const {
          sseId,
          type,
          choices,
          end,
          id,
          workflow_step,
          content,
          option,
          abort,
          ignore,
          error,
          message,
        } = deCodedData;
        sseId && setStreamId(sseId);
        id && (sidRef.current = id.toString());
        if (type === 'start') {
          return;
        }

        setIsLoading(false);
        //工具  模型返回溯源结果
        if (
          choices?.[1]?.delta?.tool_calls &&
          choices[1].delta.tool_calls.length > 0
        ) {
          setCurrentToolName(
            choices[1].delta.tool_calls[0]?.deskToolName || ''
          );
          setTraceSource(JSON.stringify(choices[1].delta.tool_calls));
          // 溯源结果更新时，也要更新流式消息
          updateStreamingMessage(ans);
        }
        // x1思考链
        if (choices?.[0]?.delta?.reasoning_content) {
          setDeepThinkText(choices?.[0]?.delta?.reasoning_content);
          updateStreamingMessage(ans);
          return;
        }
        //进度条
        if (workflow_step?.progress) {
          const percent = Math.floor(parseFloat(workflow_step?.progress) * 100);
          if (!Number.isNaN(percent)) {
            setAnswerPercent(percent);
            if (percent >= 100) {
              setAnswerPercent(0);
            }
          }
        }
        //问答节点
        if (ignore || abort) {
          nodeChat = true;
          const workflowOperation: string[] = [];
          ignore && workflowOperation.push('ignore');
          abort && workflowOperation.push('abort');
          setWorkflowOperation(workflowOperation);
        }
        nodeChatContent += content || '';
        //判断是否是选项
        if (nodeChat && option) {
          setIsWorkflowOption(true);
          setWorkflowOption({
            option: option as Option[],
            content: nodeChatContent,
          });
        }
        if (!error) {
          if (end) {
            // 完成流式消息，添加sid和id
            finishStreamingMessage(sidRef.current, id);
            controller.abort('结束');
            return;
          }
          // 更新流式消息内容
          ans = `${ans}${choices?.[0]?.delta?.content || ''}`;
          updateStreamingMessage(ans);
        } else {
          const errorMsg = message || '发生未知错误';
          updateStreamingMessage(errorMsg);
          finishStreamingMessage(sidRef.current, id);
          controller.abort('错误结束');
          return;
        }
      },
      onerror(err: Error): void {
        clearStreamingMessage();
        controllerRef.current.abort('连接错误');
        console.warn('esError', err);
      },
    }).catch((err: Error) => {
      clearStreamingMessage();
      controllerRef.current.abort('请求失败');
      console.error('fetchError', err);
    });
  };

  //发送消息
  const onSendMsg = async (params: {
    msg: string;
    workflowOperation?: string;
    version?: string;
    onSendCallback?: () => void;
  }) => {
    setIsWorkflowOption(false);
    setWorkflowOption({ option: [], content: '' });
    const { msg, workflowOperation, version, onSendCallback } = params;
    let esURL = `/chat-message/chat`;
    if (
      typeof window !== 'undefined' &&
      window.location.hostname === 'localhost'
    ) {
      esURL = `/xingchen-api/chat-message/chat`;
    } else {
      esURL = `http://172.29.201.92:8080/chat-message/chat`;
    }
    const form = new FormData();
    form.append('text', msg || '');
    form.append('chatId', `${currentChatId}`);
    form.append('workflowVersion', version || '');
    workflowOperation && form.append('workflowOperation', workflowOperation);
    // 执行回调函数
    onSendCallback && onSendCallback();
    fetchSSE(esURL, form);
  };

  //去对话页面
  const handleToChat = (botId: number) => {
    navigate(`/chat/${botId}`);
  };

  return {
    onSendMsg,
    handleToChat,
  };
};

export default useChat;
