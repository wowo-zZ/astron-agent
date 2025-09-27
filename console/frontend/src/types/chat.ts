// 聊天相关的类型定义

// 文件上传支持配置接口
export interface SupportUploadConfig {
  /** 图标类型 */
  icon: string;
  /** 提示文本 */
  tip: string;
  /** 接受的文件类型 */
  accept: string;
  /** 业务类型 */
  businessType: number;
  /** 配置值 */
  value: number;
  /** 上传限制数量 */
  limit: number;
  /** 是否必填 */
  required: boolean | null;
  /** 字段名称 */
  name: string;
  /** 文件类型 */
  type: string;
}

export interface BotInfoType {
  pc_background: string;
  botStatus: number;
  chatId: number;
  supportUpload: SupportUploadConfig[];
  model: string;
  botId: number;
  creatorNickname: string;
  prologue: string;
  mine: boolean;
  botName: string;
  avatar: string;
  botDesc: string;
  version: number;
  inputExample: string[];
  supportContext: boolean;
  isFavorite: number;
  openedTool?: string;
  config?: string[];
}

// 创建聊天接口
export interface CreateChatResponse {
  id: number;
}

// 聊天选项接口
export interface Option {
  id: string;
  text: string;
  selected?: boolean;
  contentType?: string;
}

// 工作流事件数据接口
export interface WorkflowEventData {
  content?: string;
  option?: Option[];
  type?: string;
  workflowOperation?: string[];
}

// 基础消息接口
export interface MessageListType {
  id?: number;
  message: string;
  reasoning?: string;
  traceSource?: string;
  sourceType?: 'search' | 'web_search' | string;
  chatFileList?: unknown[] | null;
  reqId?: number | string;
  sid?: string;
  tools?: string[];
  updateTime?: string;
  workflowEventData?: WorkflowEventData;
}

// 溯源数据
export interface SourceInfoItem {
  index?: number;
  url: string;
  title: string;
}

// Web搜索结果项
export interface WebSearchOutput {
  index: number;
  url: string;
  title: string;
}

// Web搜索工具结果
export interface WebSearchResult {
  outputs: WebSearchOutput[];
}

// 工具项基础接口
interface ToolItem {
  deskToolName: string;
  status: string;
  type: string;
}

// Web搜索工具项
interface WebSearchToolItem extends ToolItem {
  type: 'web_search';
  web_search: WebSearchResult;
}

// 所有工具项的联合类型
export type ToolItemUnion = WebSearchToolItem;

// 聊天数据接口
export interface ChatData {
  chatId: number;
  chatFileListNoReq: unknown[];
  historyList: MessageListType[];
}

// web bot 信息
export interface WebBotInfo {
  openedTool: string;
  config: string[];
}

// API响应接口
export interface ChatApiResponse {
  code: number;
  message: string;
  data: ChatData[];
}

//对话历史接口返回
export interface ChatHistoryResponse {
  chatFileListNoReq: unknown[];
  historyList: MessageListType[];
}

//语音转写
export interface RtasrTokenResponse {
  appid: string; // 应用ID
  ts: string; // 时间戳
  signa: string; // 签名
  url: string; // WebSocket连接地址 ← 新增字段
}

// 聊天Store状态接口
export interface ChatState {
  messageList: MessageListType[];
  streamingMessage: MessageListType | null; //正在流式输出的消息
  streamId: string; //对话流id
  answerPercent: number; //回答进度
  controllerRef: AbortController; //控制器
  isLoading: boolean; //是否正在加载
  currentToolName: string; //当前调用工具名称
  traceSource: string; //溯源结果
  deepThinkText: string; //深度思考文本
  currentChatId: number; //当前聊天id
  workflowOperation: string[]; //工作流操作
  isWorkflowOption: boolean; //是否是选项
  workflowOption: {
    option: Option[];
    content?: string;
  }; //工作流选项
}

// 聊天Store操作接口
export interface ChatActions {
  initChatStore: () => void; //初始化聊天store
  setMessageList: (messageList: MessageListType[]) => void; //设置消息列表
  addMessage: (message: MessageListType) => void; //添加消息
  startStreamingMessage: (message: MessageListType) => void; //开始流式消息
  updateStreamingMessage: (content: string) => void; //更新流式消息内容
  finishStreamingMessage: (sid?: string, id?: number) => void; //完成流式消息
  clearStreamingMessage: () => void; //清除流式消息
  setStreamId: (streamId: string) => void; //设置对话流id
  setAnswerPercent: (answerPercent: number) => void; //设置回答进度
  setControllerRef: (controllerRef: AbortController) => void; //设置控制器
  setIsLoading: (isLoading: boolean) => void; //设置是否正在加载
  setCurrentToolName: (currentToolName: string) => void; //设置当前调用工具名称
  setTraceSource: (traceSource: string) => void; //设置溯源结果
  setDeepThinkText: (deepThinkText: string) => void; //设置深度思考文本
  setCurrentChatId: (currentChatId: number) => void; //设置当前聊天id
  setWorkflowOperation: (workflowOperation: string[]) => void; //设置工作流操作
  setIsWorkflowOption: (isWorkflowOption: boolean) => void; //设置是否是选项
  setWorkflowOption: (workflowOption: {
    option: Option[];
    content?: string;
  }) => void; //设置工作流选项
}
