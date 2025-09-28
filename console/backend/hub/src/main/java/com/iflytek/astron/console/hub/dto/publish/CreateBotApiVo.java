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
@Schema(description = "create bot api vo")
public class CreateBotApiVo {

    @Schema(description = "Bot ID", example = "123")
    private Integer botId;

    // 老版创建需要 appId， 新版创建只需要keyId
    @Schema(description = "App Id")
    private String appId;
}
