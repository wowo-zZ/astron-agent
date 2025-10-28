package com.iflytek.astron.console.hub.service.bot.impl;

import cn.xfyun.api.VoiceTrainClient;
import com.alibaba.fastjson2.JSONObject;
import com.iflytek.astron.console.hub.service.bot.SpeakerTrainService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

/**
 * @author bowang
 */
@Service
@Slf4j
public class SpeakerTrainServiceImpl implements SpeakerTrainService {
    
    @Value("${spark.app-id}")
    private String appId;
    
    @Value("${spark.api-key}")
    private String apiKey;
    
    @Override
    @Cacheable(value = "speakerTrain", key = "#root.methodName", unless = "#result == null", cacheManager = "cacheManager5min")
    public JSONObject getText() {
        try {
            VoiceTrainClient client = new VoiceTrainClient.Builder(appId, apiKey).build();
            String trainText = client.trainText(5001L);
            if (StringUtils.isBlank(trainText)) {
                log.error("train text is blank");
                return null;
            }
            JSONObject object = JSONObject.parseObject(trainText);
            if (object == null || !Integer.valueOf(0).equals(object.get("code"))) {
                log.error("train text parse failed");
                return null;
            }
            return object.getJSONObject("data");
        } catch (Exception e) {
           log.error("one sentence get text failed", e);
        }
        return null;
    }
}
