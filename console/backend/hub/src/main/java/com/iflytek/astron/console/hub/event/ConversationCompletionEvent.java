package com.iflytek.astron.console.hub.event;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.context.ApplicationEvent;

/**
 * Conversation Completion Event
 * Triggered when any type of conversation is completed successfully
 * Supports: Bot conversation (Spark, Prompt, Workflow)
 *
 * @author Omuigix
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ConversationCompletionEvent extends ApplicationEvent {

    /**
     * User ID
     */
    private final String uid;

    /**
     * Space ID (nullable for personal bots)
     */
    private final Long spaceId;

    /**
     * Bot ID (nullable for non-bot conversations)
     */
    private final Integer botId;

    /**
     * Chat ID
     */
    private final Long chatId;

    /**
     * Session identifier
     */
    private final String sid;

    /**
     * Token consumed in this conversation
     */
    private final Integer tokenConsumed;

    /**
     * Conversation type: bot
     */
    private final String conversationType;

    public ConversationCompletionEvent(Object source, String uid, Long spaceId, Integer botId, 
                                     Long chatId, String sid, Integer tokenConsumed, String conversationType) {
        super(source);
        this.uid = uid;
        this.spaceId = spaceId;
        this.botId = botId;
        this.chatId = chatId;
        this.sid = sid;
        this.tokenConsumed = tokenConsumed;
        this.conversationType = conversationType;
    }

    /**
     * Create bot conversation completion event (for Spark, Prompt, Workflow conversations)
     */
    public static ConversationCompletionEvent forBot(Object source, String uid, Long spaceId, Integer botId,
                                                   Long chatId, String sid, Integer tokenConsumed) {
        return new ConversationCompletionEvent(source, uid, spaceId, botId, chatId, sid, tokenConsumed, "bot");
    }
}
