package com.iflytek.astron.console.hub.dto.workflow;

import lombok.Data;

/**
 * 工作流发布请求DTO
 */
@Data
public class WorkflowReleaseRequestDto {

    /**
     * 助手ID
     */
    private String botId;

    /**
     * 工作流ID
     */
    private String flowId;

    /**
     * 发布渠道：1-市场，2-API，3-MCP
     */
    private Integer publishChannel;

    /**
     * 发布结果：成功/失败/审核中
     */
    private String publishResult;

    /**
     * 描述信息
     */
    private String description;

    /**
     * 版本名称
     */
    private String name;

    /**
     * 版本号（时间戳格式）
     */
    private String versionNum;

    // Manual setter for versionNum in case Lombok doesn't generate it
    public void setVersionNum(String versionNum) {
        this.versionNum = versionNum;
    }

    public String getVersionNum() {
        return versionNum;
    }
}
