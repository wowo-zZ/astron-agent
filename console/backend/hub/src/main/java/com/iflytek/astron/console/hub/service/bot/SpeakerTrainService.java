package com.iflytek.astron.console.hub.service.bot;

import com.alibaba.fastjson2.JSONObject;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface SpeakerTrainService {

    JSONObject getText();

    String create(MultipartFile file, String language, Integer sex, Long segId, Long botId) throws IOException;

    JSONObject trainStatus(String taskId);
}