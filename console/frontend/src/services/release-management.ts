/** ## release-management module */
import http from '../utils/http';

/** ## get agent detail */
export const getAgentDetail = async (botId: number): Promise<any> => {
  return await http.get(`/publish/bots/${botId}`);
};

/** ## Release agents to Spark Platform
 * @param botId Agent ID -- url use
 * @param params.action Release action -- 'PUBLISH' or 'OFFLINE'
 * @param params.reason Release reason -- empty string
 * @param params.publishType Publish type -- 'MARKET', 'API', 'MCP', 'WECHAT', 'FEISHU'
 * @returns Release agent response
 */
export const handleAgentStatus = async (
  botId: number,
  params: { action: string; reason: string; publishType: string }
): Promise<void> => {
  return await http.post(`/publish/bots/${botId}`, {
    action: params.action,
    publishType: params.publishType,
    publishData: { reason: params.reason },
  });
};

/** ## get MCP service details */
export const getMCPServiceDetail = async (botId: number): Promise<void> => {
  return await http.get(`/publish/mcp/${botId}`);
};

/** ## Agent input parameter type */
export interface AgentInputParam {
  name: string;
  schema: {
    type: string;
    default?: string;
  };
  fileType?: string;
  allowedFileType?: string[];
}

/** ## get Agent input parameters */
export const getAgentInputParams = async (
  botId: number
): Promise<AgentInputParam[]> => {
  return (await http.get<AgentInputParam[]>(
    `/publish/mcp/${botId}/inputs`
  )) as unknown as AgentInputParam[];
};

/** ## Release agent to MCP */
export const releaseAgentToMCP = async (params: any): Promise<void> => {
  return await http.post(`/publish/mcp/publish`, params);
};

/** ## get Agent time series data */
export const getAgentTimeSeriesData = async (botId: number): Promise<void> => {
  return await http.get(`/publish/bots/${botId}/timeseries`);
};

/** ## get Agent summary data */
export const getAgentSummaryData = async (botId: number): Promise<void> => {
  return await http.get(`/publish/bots/${botId}/summary`);
};
