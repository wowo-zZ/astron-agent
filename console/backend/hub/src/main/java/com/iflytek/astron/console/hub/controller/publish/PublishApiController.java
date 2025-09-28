package com.iflytek.astron.console.hub.controller.publish;

import com.iflytek.astron.console.commons.annotation.RateLimit;
import com.iflytek.astron.console.commons.response.ApiResult;
import com.iflytek.astron.console.hub.dto.publish.*;
import com.iflytek.astron.console.hub.service.publish.PublishApiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author yun-zhi-ztl
 */
@Slf4j
@Tag(name = "Publish Api Controller", description = "Publish Aot As Api")
@RestController
@RequestMapping("/publish-api")
@RequiredArgsConstructor
@Validated
public class PublishApiController {

    @Autowired
    private PublishApiService publishApiService;

    @Operation(summary = "Create User App", description = "create user app")
    @RateLimit(limit = 30, window = 60, dimension = "USER")
    @PostMapping("/create-user-app")
    public ApiResult<Boolean> createUserApp(@RequestBody CreateAppVo createAppVo) {
        return ApiResult.success(publishApiService.createApp(createAppVo));
    }

    @Operation(summary = "Get App List", description = "Get user app list")
    @RateLimit(limit = 30, window = 60, dimension = "USER")
    @GetMapping("/app-list")
    public ApiResult<List<AppListDTO>> getAppList() {
        return ApiResult.success(publishApiService.getAppList());
    }

    @Operation(summary = "Create Bot Api", description = "create bot api with user app")
    @RateLimit(limit = 30, window = 60, dimension = "USER")
    @PostMapping("/create-bot-api")
    public ApiResult<BotApiInfoDTO> createBotApi(@RequestBody CreateBotApiVo requestBody) {
        return ApiResult.success(null);
    }

    @Operation(summary = "Get Api Usage", description = "User api real-time usage")
    @RateLimit(limit = 30, window = 60, dimension = "USER")
    @GetMapping("/usage-real-time")
    public ApiResult<BotApiRealTimeUsageDTO> usageRealTime(@RequestParam Integer botId) {
        return ApiResult.success(null);
    }

    @Operation(summary = "Get Api History Usage", description = "User api history usage")
    @RateLimit(limit = 30, window = 60, dimension = "USER")
    @GetMapping("/usage-history")
    public ApiResult<BotApiHistoryUsageDTO> usageHistory(@RequestParam Integer botId,
                                                         @RequestParam Integer type) {
        return ApiResult.success(null);
    }

}
