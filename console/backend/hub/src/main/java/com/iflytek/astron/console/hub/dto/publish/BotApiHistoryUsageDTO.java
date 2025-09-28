package com.iflytek.astron.console.hub.dto.publish;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * @author yun-zhi-ztl
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Bot Api History Usage DTO")
public class BotApiHistoryUsageDTO {
    @Schema(description = "Time Base", example = "[\"2025-09-21\", \"2025-09-22\"]")
    List<String> timeBase;

    @Schema(description = "Daily Usage", example = "[1, 2]")
    List<Integer> usage;
}
