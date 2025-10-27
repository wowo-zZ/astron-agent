package com.iflytek.astron.console.toolkit.entity.enumVo;

/**
 * RPA调试任务状态
 */
public enum DebugStatus {
    // 本地创建
    CREATED,
    // 已拿到 executionId
    SUBMITTED,
    // RPA PENDING（运行中）
    RUNNING,
    // RPA COMPLETED
    SUCCEEDED,
    // RPA FAILED 或本地失败
    FAILED,
    // （预留，如后续支持取消）
    CANCELED,
    // 查询失败后重试
    RETRYING,
    // 超时
    TIMEOUT
}
