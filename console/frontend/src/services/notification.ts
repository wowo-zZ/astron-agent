import http from '../utils/http';

/**
 * 获取消息分类
 * @returns 消息类型
 */
export const getAllMessageType = (): Promise<any> => {
  return http.post(`/xingchen-api/messageCenter/allTypes`);
};

/**
 * 获取全部消息
 * @param params  消息分类
 * @returns
 */
export const getAllMessage = (params: any): Promise<any> => {
  return http.post(`/notification/list`, params);
};

/**
 * 修改消息状态已读
 * @param params  消息id
 * @returns
 */
export const changeMessageStatus = (params: any): Promise<any> => {
  return http.post(`/notifications/mark-read`, params);
};

/**
 * 标记全部已读
 * @param params  消息分类
 * @returns
 */
export const readAllMessage = (params: any): Promise<any> => {
  return http.post(`/xingchen-api/messageCenter/clearUnread`, params);
};

/**
 * 获取维度消息数量
 * @param params 消息分类
 * @returns
 */
export const messageCount = (params: any): Promise<any> => {
  return http.post(`/notifications/unread-count`, params);
};

export const deleteMessage = (params: any): Promise<any> => {
  return http.delete(`/notifications/${params.id}`);
};
