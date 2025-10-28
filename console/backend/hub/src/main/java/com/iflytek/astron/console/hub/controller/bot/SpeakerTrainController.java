package com.iflytek.astron.console.hub.controller.bot;


import com.alibaba.fastjson2.JSONObject;
import com.iflytek.astron.console.commons.annotation.RateLimit;
import com.iflytek.astron.console.commons.annotation.space.SpacePreAuth;
import com.iflytek.astron.console.commons.response.ApiResult;
import com.iflytek.astron.console.commons.util.space.SpaceInfoUtil;
import com.iflytek.astron.console.hub.entity.CustomSpeaker;
import com.iflytek.astron.console.hub.service.bot.CustomSpeakerService;
import com.iflytek.astron.console.hub.service.bot.SpeakerTrainService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * @author bowang
 */
@Slf4j
@RestController
@RequestMapping("/speaker/train")
@RequiredArgsConstructor
public class SpeakerTrainController {

    private final SpeakerTrainService speakerTrainService;

    private final CustomSpeakerService customSpeakerService;

    @Operation(summary = "create speaker")
    @PostMapping("/create")
    @RateLimit()
    @SpacePreAuth(key = "SpeakerTrainController_create_POST")
    public ApiResult<String> create(
            @RequestParam MultipartFile file,
            @RequestParam String language,
            @RequestParam Long segId,
            @RequestParam Integer sex) throws IOException {
        Long spaceId = SpaceInfoUtil.getSpaceId();
        String uid = SpaceInfoUtil.getUidByCurrentSpaceId();
        return ApiResult.success(speakerTrainService.create(file, language, sex, segId, spaceId, uid));
    }

    @Operation(summary = "get text")
    @GetMapping("/get-text")
    public ApiResult<JSONObject> getText() {
        return ApiResult.success(speakerTrainService.getText());
    }


    @Operation(summary = "train status")
    @GetMapping("/train-status")
    @SpacePreAuth(key = "SpeakerTrainController_trainStatus_GET")
    public ApiResult<JSONObject> trainStatus(String taskId) {
        Long spaceId = SpaceInfoUtil.getSpaceId();
        String uid = SpaceInfoUtil.getUidByCurrentSpaceId();
        return ApiResult.success(speakerTrainService.trainStatus(taskId, spaceId, uid));
    }

    @Operation(summary = "get train speaker")
    @GetMapping("/train-speaker")
    @SpacePreAuth(key = "SpeakerTrainController_trainSpeaker_GET")
    public ApiResult<List<CustomSpeaker>> trainSpeaker() {
        Long spaceId = SpaceInfoUtil.getSpaceId();
        String uid = SpaceInfoUtil.getUidByCurrentSpaceId();
        return ApiResult.success(customSpeakerService.getTrainSpeaker(spaceId, uid));
    }


    @Operation(summary = "update train speaker")
    @PostMapping("/update-speaker")
    @SpacePreAuth(key = "SpeakerTrainController_updateTrainSpeaker_POST")
    public ApiResult<Void> updateTrainSpeaker(Long id, String name) {
        Long spaceId = SpaceInfoUtil.getSpaceId();
        String uid = SpaceInfoUtil.getUidByCurrentSpaceId();
        customSpeakerService.updateTrainSpeaker(id, name, spaceId, uid);
        return ApiResult.success();
    }
    

}
