package com.iflytek.astron.console.hub.service.bot.impl;

import com.alibaba.fastjson2.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.iflytek.astron.console.commons.constant.ResponseEnum;
import com.iflytek.astron.console.commons.dto.bot.PersonalityConfigDto;
import com.iflytek.astron.console.commons.entity.bot.PersonalityConfig;
import com.iflytek.astron.console.commons.enums.bot.ConfigTypeEnum;
import com.iflytek.astron.console.commons.exception.BusinessException;
import com.iflytek.astron.console.commons.mapper.bot.PersonalityConfigMapper;
import com.iflytek.astron.console.commons.util.I18nUtil;
import com.iflytek.astron.console.hub.service.bot.PersonalityConfigService;
import com.iflytek.astron.console.hub.util.BotAIServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PersonalityConfigServiceImpl implements PersonalityConfigService {

    private final PersonalityConfigMapper personalityConfigMapper;

    private final BotAIServiceClient aiServiceClient;


    @Override
    public String aiGeneratedPersonality(String botName, String category, String info, String prompt) {
        if (StringUtils.isBlank(botName) || StringUtils.isBlank(category) || StringUtils.isBlank(info)
                || StringUtils.isBlank(prompt)) {
            throw new BusinessException(ResponseEnum.PERSONALITY_AI_GENERATE_PARAM_EMPTY);
        }
        String answer;
        try {
            String format = smartFormat(I18nUtil.getMessage("personality.ai.generated"), botName, category, info, prompt);
            answer = aiServiceClient.generateText(format, "gpt4", 60);
        } catch (Exception e) {
            throw new BusinessException(ResponseEnum.PERSONALITY_AI_GENERATE_ERROR);
        }
        if (StringUtils.isBlank(answer)) {
            throw new BusinessException(ResponseEnum.PERSONALITY_AI_GENERATE_ERROR);
        }
        return answer;
    }

    @Override
    public String aiPolishing(String botName, String category, String info, String prompt, String personality) {
        if (StringUtils.isBlank(botName) || StringUtils.isBlank(category) || StringUtils.isBlank(info)
                || StringUtils.isBlank(prompt)) {
            throw new BusinessException(ResponseEnum.PERSONALITY_AI_GENERATE_PARAM_EMPTY);
        }
        String answer;
        try {
            String format = smartFormat(I18nUtil.getMessage("personality.ai.polishing"), botName, category, info, prompt, personality);
            answer = aiServiceClient.generateText(format, "gpt4", 60);
        } catch (Exception e) {
            throw new BusinessException(ResponseEnum.PERSONALITY_AI_GENERATE_ERROR);
        }
        if (StringUtils.isBlank(answer)) {
            throw new BusinessException(ResponseEnum.PERSONALITY_AI_GENERATE_ERROR);
        }
        return answer;
    }

    @Override
    public String getChatPrompt(Long botId, String originalPrompt, boolean isCreator) {
        ConfigTypeEnum configType = isCreator ? ConfigTypeEnum.DEBUG : ConfigTypeEnum.MARKET;
        PersonalityConfig personalityConfig = personalityConfigMapper.selectOne(new LambdaQueryWrapper<PersonalityConfig>()
                .eq(PersonalityConfig::getBotId, botId)
                .eq(PersonalityConfig::getConfigType, configType.getValue())
                .eq(PersonalityConfig::getDeleted, 0)
                .eq(PersonalityConfig::getEnabled, 1));
        if (personalityConfig == null) {
            return originalPrompt;
        }
        return getChatPrompt(personalityConfig, originalPrompt);
    }

    @Override
    public String getChatPrompt(String personalityConfig, String originalPrompt) {
        if (StringUtils.isBlank(personalityConfig)) {
            return originalPrompt;
        }
        PersonalityConfig config;
        try {
            config = JSONObject.parseObject(personalityConfig, PersonalityConfig.class);
        } catch (Exception e) {
            log.error("parse personality config error, config: {}", personalityConfig, e);
            return originalPrompt;
        }
        return getChatPrompt(config, originalPrompt);
    }

    @Override
    public void setDisabledByBotId(Long botId) {
        personalityConfigMapper.setDisabledByBotIdAndConfigType(botId, ConfigTypeEnum.DEBUG.getValue());
    }

    @Override
    public boolean checkPersonalityConfig(PersonalityConfigDto personalityConfigDto) {
        if (personalityConfigDto == null
                || StringUtils.isBlank(personalityConfigDto.getPersonality())
                || personalityConfigDto.getPersonality().length() > 1000) {
            return true;
        }

        if (personalityConfigDto.getSceneType() != null) {
            return ConfigTypeEnum.fromValue(personalityConfigDto.getSceneType()) == null
                    || StringUtils.isBlank(personalityConfigDto.getSceneInfo()) || personalityConfigDto.getSceneInfo().length() > 1000;
        } else {
            // scene type is null, scene info must be null
            return StringUtils.isNotBlank(personalityConfigDto.getSceneInfo());
        }
    }

    @Override
    public void insertOrUpdate(PersonalityConfigDto personalityConfigDto, Long botId, ConfigTypeEnum configType) {
        PersonalityConfig existingConfig = personalityConfigMapper.selectOne(
                new LambdaQueryWrapper<PersonalityConfig>()
                        .eq(PersonalityConfig::getBotId, botId)
                        .eq(PersonalityConfig::getConfigType, configType.getValue())
                        .eq(PersonalityConfig::getDeleted, 0));

        LocalDateTime now = LocalDateTime.now();

        if (existingConfig != null) {
            // Update existing record
            existingConfig.setPersonality(personalityConfigDto.getPersonality());
            existingConfig.setSceneType(personalityConfigDto.getSceneType());
            existingConfig.setSceneInfo(personalityConfigDto.getSceneInfo());
            existingConfig.setEnabled(1);
            existingConfig.setUpdateTime(now);
            personalityConfigMapper.updateById(existingConfig);
        } else {
            // Insert new record
            PersonalityConfig newConfig = new PersonalityConfig();
            newConfig.setBotId(botId);
            newConfig.setConfigType(configType.getValue());
            newConfig.setPersonality(personalityConfigDto.getPersonality());
            newConfig.setSceneType(personalityConfigDto.getSceneType());
            newConfig.setSceneInfo(personalityConfigDto.getSceneInfo());
            newConfig.setEnabled(1);
            newConfig.setCreateTime(now);
            newConfig.setUpdateTime(now);
            personalityConfigMapper.insert(newConfig);
        }
    }

    @Override
    public PersonalityConfigDto getPersonalConfig(Long botId) {
        return null;
    }


    public String getChatPrompt(PersonalityConfig personalityConfig, String originalPrompt) {
        if (personalityConfig == null) {
            return originalPrompt;
        }
        return smartFormat(I18nUtil.getMessage("personality.prompt"), personalityConfig.getPersonality(), personalityConfig.getSceneInfo(),
                originalPrompt);
    }

    private String smartFormat(String template, Object... args) {
        String result = template;
        for (Object arg : args) {
            if (result.contains("%s")) {
                if (arg == null) {
                    // 参数为 null，则去掉对应的 "%s" 以及前面多余的逗号或空格
                    result = result.replaceFirst("\\s*,?\\s*%s", "");
                } else {
                    result = result.replaceFirst("%s", arg.toString());
                }
            }
        }
        return result;
    }
}
