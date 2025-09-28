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
@Schema(description = "App List Info DTO")
public class AppListDTO {

    @Schema(description = "App Id")
    private String appId;

    @Schema(description = "App Name")
    private String appName;

    @Schema(description = "App Describe")
    private String appDescribe;
}
