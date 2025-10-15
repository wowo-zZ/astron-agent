package com.iflytek.astron.console.hub.listener;

import com.iflytek.astron.console.hub.event.ConversationCompletionEvent;
import com.iflytek.astron.console.hub.service.publish.BotPublishService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Conversation Completion Event Listener
 * Handles all types of conversation completion events and records statistics
 * Supports: Bot, Workflow, Prompt, Debug conversations
 *
 * @author Omuigix
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ConversationCompletionEventListener {

    private final BotPublishService botPublishService;

    /**
     * Handle conversation completion event
     * Records conversation statistics asynchronously for all conversation types
     *
     * @param event Conversation completion event
     */
    @Async
    @EventListener
    public void handleConversationCompletion(ConversationCompletionEvent event) {
        log.info("Received conversation completion event: type={}, chatId={}, botId={}, uid={}", 
                event.getConversationType(), event.getChatId(), event.getBotId(), event.getUid());

        try {
            // Record statistics for all conversation types
            // For non-bot conversations, botId might be null, but we still record the conversation
            botPublishService.recordConversationStats(
                    event.getUid(),
                    event.getSpaceId(),
                    event.getBotId(), // May be null for non-bot conversations
                    event.getChatId(),
                    event.getSid(),
                    event.getTokenConsumed()
            );
            log.debug("Successfully recorded conversation statistics for type={}, chatId={}", 
                    event.getConversationType(), event.getChatId());
        } catch (Exception e) {
            log.error("Failed to record conversation statistics for type={}, chatId={}", 
                    event.getConversationType(), event.getChatId(), e);
        }
    }
}
