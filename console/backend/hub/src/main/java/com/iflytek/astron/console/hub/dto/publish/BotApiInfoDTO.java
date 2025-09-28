package com.iflytek.astron.console.hub.dto.publish;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author yun-zhi-ztl
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Bot Api Info DTO")
public class BotApiInfoDTO {

    @Schema(description = "Bot ID", example = "123")
    private Integer botId;

    @Schema(description = "Bot Name", example = "translation bot")
    private String botName;

    @Schema(description = "App Name", example = "translation app")
    private String appName;

    @Schema(description = "App Id", example = "e934fe")
    private String appId;

    @Schema(description = "API Key", example = "user_api_key")
    private String apiKey;

    @Schema(description = "API Secret", example = "user_api_secret")
    private String apiSecret;

    @Schema(description = "Assistant API endpoint address", example = "https://api.example.com/v1")
    private String serviceUrl;

    @Schema(description = "Workflow ID", example = "wf_123456")
    private String flowId;

}

