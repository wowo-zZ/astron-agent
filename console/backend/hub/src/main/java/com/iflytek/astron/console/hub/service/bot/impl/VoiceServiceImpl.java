package com.iflytek.astron.console.hub.service.bot.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.iflytek.astron.console.hub.entity.PronunciationPersonConfig;
import com.iflytek.astron.console.hub.mapper.PronunciationPersonConfigMapper;
import com.iflytek.astron.console.hub.service.bot.VoiceService;
import com.iflytek.astron.console.toolkit.tool.http.HttpAuthTool;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author bowang
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VoiceServiceImpl implements VoiceService {

    @Value("${spark.app-id}")
    private String appId;

    @Value("${spark.api-key}")
    private String apiKey;

    @Value("${spark.api-secret}")
    private String apiSecret;

    @Value("${spark.tts-api-url}")
    private String ttsApiUrl;

    private final PronunciationPersonConfigMapper pronunciationPersonConfigMapper;

    @Override
    public Map<String, String> getTtsSign() {
        Map<String, String> resultMap = new HashMap<>();
        String url = HttpAuthTool.assembleRequestUrl(ttsApiUrl, apiKey, apiSecret);
        resultMap.put("appId", appId);
        resultMap.put("url", url);
        return resultMap;
    }

    @Override
    @Cacheable(value = "pronunciationPersonCache", key = "#root.methodName", cacheManager = "cacheManager5min")
    public List<PronunciationPersonConfig> getPronunciationPerson() {
        LambdaQueryWrapper<PronunciationPersonConfig> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(PronunciationPersonConfig::getModelManufacturer, PronunciationPersonConfig.ModelManufacturerEnum.XFYUN);
        queryWrapper.eq(PronunciationPersonConfig::getDeleted, 0);
        queryWrapper.orderByAsc(PronunciationPersonConfig::getSort);
        return pronunciationPersonConfigMapper.selectList(queryWrapper);
    }
}
