package com.iflytek.astron.console.hub.controller.bot;

import com.iflytek.astron.console.commons.annotation.RateLimit;
import com.iflytek.astron.console.commons.response.ApiResult;
import com.iflytek.astron.console.hub.entity.PronunciationPersonConfig;
import com.iflytek.astron.console.hub.service.bot.VoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * @author bowang
 */
@Slf4j
@RestController
@RequestMapping("/voice")
@RequiredArgsConstructor
public class VoiceApiController {

    private final VoiceService voiceService;

    @GetMapping(value = "/tts-sign")
    @RateLimit()
    public ApiResult<Map<String, String>> ttsSign() {
        return ApiResult.success(voiceService.getTtsSign());
    }

    @GetMapping(value = "/get-pronunciation-person")
    public ApiResult<List<PronunciationPersonConfig>> getPronunciationPerson() {
        return ApiResult.success(voiceService.getPronunciationPerson());
    }

}
