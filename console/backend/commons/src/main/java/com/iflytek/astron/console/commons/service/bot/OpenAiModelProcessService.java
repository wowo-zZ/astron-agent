package com.iflytek.astron.console.commons.service.bot;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * OpenAI model processing service interface
 */
public interface OpenAiModelProcessService {

    String processNonStreaming(String prompt);

    /**
     * Streaming call to OpenAI API
     *
     * @param prompt User input prompt
     * @return SseEmitter object for real-time streaming response data
     */
    SseEmitter processStreaming(String prompt);
}
