package com.iflytek.astron.console.hub.strategy.publish.impl;

import com.iflytek.astron.console.commons.enums.bot.BotPublishTypeEnum;
import com.iflytek.astron.console.commons.response.ApiResult;
import com.iflytek.astron.console.hub.dto.publish.PublishStatusUpdateDto;
import com.iflytek.astron.console.hub.service.publish.BotPublishService;
import com.iflytek.astron.console.hub.strategy.publish.PublishStrategy;
import com.alibaba.fastjson2.JSON;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Market publish strategy implementation Handles bot publishing to market channel
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MarketPublishStrategy implements PublishStrategy {

    private final BotPublishService botPublishService;

    @Override
    @Transactional
    public ApiResult<Object> publish(Integer botId, Object publishData, String currentUid, Long spaceId) {
        log.info("Publishing bot to market: botId={}, currentUid={}, spaceId={}", botId, currentUid, spaceId);

        try {
            // Parse publish data (optional market-specific data like category, tags, etc.)
            PublishStatusUpdateDto updateDto = new PublishStatusUpdateDto();
            updateDto.setAction("PUBLISH");

            // If publishData contains additional market configuration, parse it
            if (publishData != null) {
                log.debug("Market publish data: {}", JSON.toJSONString(publishData));
                // TODO: Parse market-specific data like category, tags, visibility settings
            }

            // Delegate to existing market publish logic
            botPublishService.updatePublishStatus(botId, updateDto, currentUid, spaceId);

            log.info("Market publish completed successfully: botId={}", botId);

            log.info("Market publish completed successfully: botId={}", botId);
            return ApiResult.success(null); // No specific data needed for market publish

        } catch (Exception e) {
            log.error("Market publish failed: botId={}, error={}", botId, e.getMessage(), e);
            throw e; // Let the controller handle the exception and convert to ApiResult
        }
    }

    @Override
    public ApiResult<Object> offline(Integer botId, Object publishData, String currentUid, Long spaceId) {
        log.info("Offlining bot from market: botId={}, currentUid={}, spaceId={}", botId, currentUid, spaceId);

        try {
            // Create offline request
            PublishStatusUpdateDto updateDto = new PublishStatusUpdateDto();
            updateDto.setAction("OFFLINE");

            // Delegate to existing market offline logic
            botPublishService.updatePublishStatus(botId, updateDto, currentUid, spaceId);

            log.info("Market offline completed successfully: botId={}", botId);

            log.info("Market offline completed successfully: botId={}", botId);
            return ApiResult.success(null); // No specific data needed for market offline

        } catch (Exception e) {
            log.error("Market offline failed: botId={}, error={}", botId, e.getMessage(), e);
            throw e; // Let the controller handle the exception and convert to ApiResult
        }
    }

    @Override
    public String getPublishType() {
        return BotPublishTypeEnum.MARKET.getCode();
    }
}
