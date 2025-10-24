package com.iflytek.astron.console.toolkit.entity.dto.rpa;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class StartReq {
    @NotBlank
    private String projectId;
    private String execPosition = "EXECUTOR";
    // 可空，默认 RPA 当前启用版本
    private Integer version;
    private Map<String, Object> params = Map.of();
}
