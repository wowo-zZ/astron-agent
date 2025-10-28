package com.iflytek.astron.console.hub.controller.bot;


import com.alibaba.fastjson2.JSONObject;
import com.iflytek.astron.console.commons.annotation.RateLimit;
import com.iflytek.astron.console.commons.annotation.space.SpacePreAuth;
import com.iflytek.astron.console.commons.response.ApiResult;
import com.iflytek.astron.console.hub.service.bot.SpeakerTrainService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
    @SpacePreAuth(key = "SpeakerTrainController.create", module = "Speaker Train", point = "Create Speaker", description = "Create Speaker")
    @RateLimit()
    public ApiResult<Boolean> create(
            @RequestParam MultipartFile file,
            @RequestParam String sex,
            @RequestParam Integer index) {
        // if (!speakerTrainService.create(RequestContextUtil.getUID(), file, sex, index)) {
        //     return ApiResult.error(ResponseEnum.SPEAKER_TRAIN_CREATE_FAILED);
        // }

        return ApiResult.success(true);
    }

    @Operation(summary = "get text")
    @GetMapping("/get-text")
    public ApiResult<JSONObject> getText() {
        return ApiResult.success(speakerTrainService.getText());
    }


}
