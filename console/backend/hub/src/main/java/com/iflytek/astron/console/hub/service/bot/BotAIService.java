package com.iflytek.astron.console.hub.service.bot;

import com.iflytek.astron.console.hub.dto.bot.BotGenerationDTO;

/**
 * Chatbot AI service interface
 */
public interface BotAIService {

    /**
     * AI generate assistant avatar
     *
     * @param uid User ID
     * @param botName Assistant name
     * @param botDesc Assistant description
     * @return Generated avatar URL
     */
    String generateAvatar(String uid, String botName, String botDesc);

    /**
     * Generate assistant with one sentence
     *
     * @param sentence One-sentence description
     * @param uid User ID
     * @return Generated assistant details
     */
    BotGenerationDTO sentenceBot(String sentence, String uid);

    /**
     * Large model generate assistant prologue
     *
     * @param botName Robot name
     * @return Generated prologue
     */
    String generatePrologue(String botName);

    /**
     * Generate 3 input examples for a bot
     *
     * @param botName bot name
     * @param botDesc bot description
     * @param prompt bot prompt/instruction
     * @return up to 3 input examples (may be empty on failure)
     */
    java.util.List<String> generateInputExample(String botName, String botDesc, String prompt);
}
