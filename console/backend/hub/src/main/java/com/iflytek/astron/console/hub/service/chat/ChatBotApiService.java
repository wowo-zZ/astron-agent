package com.iflytek.astron.console.hub.service.chat;

import com.iflytek.astron.console.commons.dto.bot.ChatBotApi;

import java.util.List;

public interface ChatBotApiService {

    List<ChatBotApi> getBotApiList(String uid);

    boolean exists(Long botId);

    Long selectCount(Integer botId);

    void insert(String uid, Integer botId, String assistantId, String appId, String appSecret, String appKey,
            String prompt, String pluginIds, String embeddingIds, String apiPath, String description);
}
