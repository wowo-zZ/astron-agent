import {
  BotInfoType,
  CreateChatResponse,
  ChatHistoryResponse,
  RtasrTokenResponse,
  WebBotInfo,
} from '@/types/chat';
import http from '@/utils/http';
import type { AxiosResponse } from 'axios';

/**
 * 获取智能体
 * @param botId 必传 智能体Id
 * @param workflowVersion 非必传 智能体版本
 * @returns
 */
export async function getBotInfoApi(
  botId: number,
  workflowVersion?: string
): Promise<BotInfoType> {
  return http.get(
    `/chat-list/v1/get-bot-info?botId=${botId}&workflowVersion=${workflowVersion}`
  );
}

/**
 * 获取工作流智能体信息
 * @param botId 必传 智能体Id
 * @returns
 */
export async function getWorkflowBotInfoApi(
  botId: number
): Promise<WebBotInfo> {
  return http.get(`/workflow/web/info?botId=${botId}`);
}

/**
 * 获取会话历史
 * @param chatId 聊天Id
 * @returns
 */
export async function getChatHistory(
  chatId: number
): Promise<ChatHistoryResponse[]> {
  return http.get(`/chat-history/all/${chatId}`);
}

/**
 * 获取全部聊天列表
 * @returns
 */
export async function postChatList(): Promise<BotInfoType[]> {
  return http.post('/chat-list/all-chat-list');
}

/**
 * 全新对话
 * @param chatId 聊天Id
 * @returns
 */
export async function postNewChat(chatId: number): Promise<AxiosResponse> {
  return http.post(`/chat-restart/restart?chatId=${chatId}`);
}

/**
 * 中止生成
 * @param streamId 对话流Id
 * @returns
 */
export async function postStopChat(streamId: string): Promise<AxiosResponse> {
  return http.post(`/chat-message/stop?streamId=${streamId}`);
}

/**
 * 清除对话历史
 * @param chatId 聊天Id
 * @param botId 智能体Id
 * @returns
 */
export async function clearChatList(
  chatId: number,
  botId: number
): Promise<{ id: number }> {
  return http.get(`/chat-message/clear?chatId=${chatId}&botId=${botId}`);
}

/**
 * 创建对话
 * @param botId 智能体Id
 * @returns
 */
export async function postCreateChat(
  botId: number
): Promise<CreateChatResponse> {
  return http.post('/chat-list/v1/create-chat-list', { botId });
}

export const deleteChatList = (params: any) => {
  return http.post(`/chat-list/v1/del-chat-list`, params);
};
/**
 * 获取语音识别token
 * @returns
 */
export async function getRtasrToken(): Promise<RtasrTokenResponse> {
  return http.post('/rtasr/rtasr-sign');
}

/**
 * 获取分享key
 * @param params
 * @returns
 */
export const getShareAgentKey = (params: {
  relateType: number;
  relateId: number;
}): Promise<{ shareAgentKey: string }> => {
  return http.post('/share/get-share-key', params);
};

/**根据分享key  创建会话 */
export const createChatByShareKey = (params: {
  shareAgentKey: string;
}): Promise<{ id: number }> => {
  return http.post('/share/add-shared-agent', params);
};
