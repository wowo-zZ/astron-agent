package com.iflytek.astron.console.hub.service.bot.impl;

import cn.hutool.core.util.RandomUtil;
import cn.xfyun.api.VoiceTrainClient;
import cn.xfyun.config.AgeGroupEnum;
import cn.xfyun.config.SexEnum;
import cn.xfyun.model.voiceclone.request.AudioAddParam;
import cn.xfyun.model.voiceclone.request.CreateTaskParam;
import com.alibaba.fastjson2.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.iflytek.astron.console.commons.constant.ResponseEnum;
import com.iflytek.astron.console.commons.exception.BusinessException;
import com.iflytek.astron.console.hub.entity.CustomSpeaker;
import com.iflytek.astron.console.hub.service.bot.CustomSpeakerService;
import com.iflytek.astron.console.hub.service.bot.SpeakerTrainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

/**
 * @author bowang
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class SpeakerTrainServiceImpl implements SpeakerTrainService {

    private static final Set<String> SUPPORTED_LANGUAGES = Set.of("zh", "en", "jp", "ko", "ru");

    @Value("${spark.app-id}")
    private String appId;

    @Value("${spark.api-key}")
    private String apiKey;


    private final CustomSpeakerService customSpeakerService;

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

    @Override
    public String create(MultipartFile file, String language, Integer sex, Long segId, Long spaceId, String uid) throws IOException {
        if (StringUtils.isNotBlank(language) && !SUPPORTED_LANGUAGES.contains(language)) {
            throw new BusinessException(ResponseEnum.OPERATION_FAILED);
        }
        log.info("java.io.tmpdir: {}", System.getProperty("java.io.tmpdir"));
        File tempFile = File.createTempFile(UUID.randomUUID().toString(), "_" + file.getOriginalFilename());
        file.transferTo(tempFile);
        try {
            VoiceTrainClient client = new VoiceTrainClient.Builder(appId, apiKey).build();
            // create task
            SexEnum sexEnum = Integer.valueOf(1).equals(sex) ? SexEnum.MALE : SexEnum.FEMALE;
            CreateTaskParam createTaskParam = CreateTaskParam.builder()
                    .sex(sexEnum.getValue())
                    .ageGroup(AgeGroupEnum.YOUTH.getValue())
                    .language(language)
                    .build();
            String taskResp = client.createTask(createTaskParam);
            JSONObject taskObj = JSONObject.parseObject(taskResp);
            String taskId = taskObj.getString("data");
            log.info("创建任务：{}，返回taskId：{}", taskResp, taskId);

            AudioAddParam audioAddParam2 = AudioAddParam.builder()
                    .file(tempFile)
                    .taskId(taskId)
                    .textId(5001L)
                    .textSegId(segId)
                    .build();
            String submitWithAudio = client.submitWithAudio(audioAddParam2);
            log.info("提交任务返回: {}", submitWithAudio);

            // 保存custom_speaker
            CustomSpeaker customSpeaker = new CustomSpeaker();
            customSpeaker.setCreateUid(uid);
            customSpeaker.setSpaceId(spaceId);
            customSpeaker.setName("my_speaker_" + RandomUtil.randomString(5));
            customSpeaker.setTaskId(taskId);
            customSpeakerService.save(customSpeaker);

            return taskId;
        } catch (Exception e) {
            log.error("create task failed", e);
            return null;
        } finally {
            if (tempFile.exists()) {
                if (!tempFile.delete()) {
                    log.error("Failed to delete temporary file: {}", tempFile.getAbsolutePath());
                }
            }
        }
    }

    @Override
    public JSONObject trainStatus(String taskId, Long spaceId, String uid) {
        
        LambdaQueryWrapper<CustomSpeaker> queryWrapper = Wrappers.lambdaQuery(CustomSpeaker.class)
                .eq(CustomSpeaker::getTaskId, taskId)
                .eq(CustomSpeaker::getDeleted, 0);
        if (spaceId == null) {
            queryWrapper.eq(CustomSpeaker::getCreateUid, uid);
            queryWrapper.isNull(CustomSpeaker::getSpaceId);
        } else {
            queryWrapper.eq(CustomSpeaker::getSpaceId, spaceId);
        }
        
        CustomSpeaker customSpeaker = customSpeakerService.getOne(queryWrapper);
        if (customSpeaker == null) {
            throw new BusinessException(ResponseEnum.OPERATION_FAILED);
        }
        
        try {
            VoiceTrainClient client = new VoiceTrainClient.Builder(appId, apiKey).build();
            String trainStatus = client.result(taskId);
            if (StringUtils.isBlank(trainStatus)) {
                throw new BusinessException(ResponseEnum.OPERATION_FAILED);
            }
            JSONObject object = JSONObject.parseObject(trainStatus);
            if (object == null || !Integer.valueOf(0).equals(object.get("code"))) {
                throw new BusinessException(ResponseEnum.OPERATION_FAILED);
            }
            JSONObject data = object.getJSONObject("data");
            if (Integer.valueOf(1).equals(data.getInteger("trainStatus"))) {
                LambdaUpdateWrapper<CustomSpeaker> updateWrapper = new LambdaUpdateWrapper<>();
                updateWrapper.eq(CustomSpeaker::getId, customSpeaker.getId());
                updateWrapper.set(CustomSpeaker::getTrainStatus, 1);
                updateWrapper.set(CustomSpeaker::getAssetId, data.getString("assetId"));
                updateWrapper.set(CustomSpeaker::getUpdateTime, LocalDateTime.now());
                customSpeakerService.update(null, updateWrapper);
            }
            return data;
        } catch (Exception e) {
            log.error("train status failed, taskId: {}", taskId, e);
        }
        return null;
    }
}
