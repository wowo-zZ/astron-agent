/** ## release-management module */
import http from '../utils/http';
import qs from 'qs';
import { Base64 } from 'js-base64';

/** ## get agent detail */
export const getAgentDetail = async (botId: number) => {
  return await http.get(`/publish/bots/${botId}`);
};

/** ## Release agents to Spark Platform
 * @param botId Agent ID -- url use
 * @param params.action Release action -- 'PUBLISH' or 'OFFLINE'
 * @param params.reason Release reason -- empty string
 * @returns Release agent response
 */
export const handleAgentStatus = async (
  botId: number,
  params: { action: string; reason: '' }
) => {
  return await http.post(`/publish/bots/${botId}/status`, {
    action: params.action,
    reason: params.reason,
  });
};

/** ## get MCP service details */
export const getMCPServiceDetail = async (botId: number) => {
  return await http.get(`/publish/mcp/${botId}`);
};

/** ## get Agent input parameters */
export const getAgentInputParams = async (botId: number) => {
  return await http.get(`/publish/mcp/${botId}/inputs`);
};

/** ## Release agent to MCP */
export const releaseAgentToMCP = async (params: any) => {
  return await http.post(`/publish/mcp/publish`, params);
};

/** ## get Agent time series data */
export const getAgentTimeSeriesData = async (botId: number) => {
  return await http.get(`/publish/bots/${botId}/timeseries`);
};

/** ## get Agent summary data */
export const getAgentSummaryData = async (botId: number) => {
  return await http.get(`/publish/bots/${botId}/summary`);
};
