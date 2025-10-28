package com.iflytek.astron.console.hub.controller.bot;


import com.alibaba.fastjson2.JSONObject;
import com.iflytek.astron.console.commons.annotation.RateLimit;
import com.iflytek.astron.console.commons.response.ApiResult;
import com.iflytek.astron.console.hub.service.bot.SpeakerTrainService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * @author bowang
 */
@Slf4j
@RestController
@RequestMapping("/speaker/train")
@RequiredArgsConstructor
public class SpeakerTrainController {

    private final SpeakerTrainService speakerTrainService;

    @Operation(summary = "create speaker")
    @PostMapping("/create")
    @RateLimit()
    public ApiResult<String> create(
            @RequestParam MultipartFile file,
            @RequestParam String language,
            @RequestParam Long segId,
            @RequestParam Long botId,
            @RequestParam Integer sex) throws IOException {
        return ApiResult.success(speakerTrainService.create(file, language, sex, segId, botId));
    }

    @Operation(summary = "get text")
    @GetMapping("/get-text")
    public ApiResult<JSONObject> getText() {
        return ApiResult.success(speakerTrainService.getText());
    }


    @Operation(summary = "train status")
    @PostMapping("/train-status")
    public ApiResult<JSONObject> trainStatus(String taskId) {
        return ApiResult.success(speakerTrainService.trainStatus(taskId));
    }


}
