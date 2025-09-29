package com.iflytek.astron.console.hub.service.workflow;

import com.iflytek.astron.console.hub.dto.workflow.WorkflowReleaseResponseDto;

/**
 * 工作流发布服务接口 负责处理工作流助手的发布、版本管理和API同步 简化版本：无审核流程，直接发布
 */
public interface WorkflowReleaseService {

    /**
     * 发布工作流助手到指定渠道 直接发布，无需审核
     *
     * @param botId 助手ID
     * @param uid 用户ID
     * @param spaceId 空间ID
     * @param publishType 发布类型：MARKET, API, MCP
     * @return 发布结果
     */
    WorkflowReleaseResponseDto publishWorkflow(Integer botId, String uid, Long spaceId, String publishType);

}
