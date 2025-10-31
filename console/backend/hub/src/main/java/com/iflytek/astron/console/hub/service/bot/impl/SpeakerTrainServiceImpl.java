package com.iflytek.astron.console.hub.service.bot.impl;

import cn.hutool.core.util.RandomUtil;
import cn.xfyun.api.VoiceTrainClient;
import cn.xfyun.config.AgeGroupEnum;
import cn.xfyun.config.SexEnum;
import cn.xfyun.model.voiceclone.request.AudioAddParam;
import cn.xfyun.model.voiceclone.request.CreateTaskParam;
import com.alibaba.fastjson2.JSONObject;
import com.iflytek.astron.console.commons.constant.ResponseEnum;
import com.iflytek.astron.console.commons.exception.BusinessException;
import com.iflytek.astron.console.commons.util.AudioValidator;
import com.iflytek.astron.console.hub.entity.CustomSpeaker;
import com.iflytek.astron.console.hub.service.bot.CustomSpeakerService;
import com.iflytek.astron.console.hub.service.bot.SpeakerTrainService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Paths;
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

    // API response constants
    private static final Integer SUCCESS_CODE = 0;
    private static final Integer TRAIN_STATUS_SUCCESS = 1;
    private static final Integer TRAIN_STATUS_FAILED = 0;
    private static final Integer TRAIN_STATUS_DRAFT = 2;

    // Training timeout constants
    private static final int MAX_RETRIES = 15;
    private static final int RETRY_INTERVAL_MS = 2000;

    private final CustomSpeakerService customSpeakerService;

    private final VoiceTrainClient voiceTrainClient;

    @Override
    @Cacheable(value = "speakerTrain", key = "#root.methodName", unless = "#result == null", cacheManager = "cacheManager5min")
    public JSONObject getText() {
        try {
            String trainText = voiceTrainClient.trainText(5001L);
            if (StringUtils.isBlank(trainText)) {
                log.error("train text is blank");
                return null;
            }
            JSONObject object = JSONObject.parseObject(trainText);
            if (object == null || !SUCCESS_CODE.equals(object.get("code"))) {
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
    public String create(MultipartFile file, String language, Integer sex, Long segId, Long spaceId, String uid) throws Exception {
        if (StringUtils.isNotBlank(language) && !SUPPORTED_LANGUAGES.contains(language)) {
            throw new BusinessException(ResponseEnum.OPERATION_FAILED);
        }

        // validate audio file
        AudioValidator.validateAudioFile(file);

        String sanitizedFilename = sanitizeFilename(file.getOriginalFilename());
        File tempFile = File.createTempFile(UUID.randomUUID().toString(), "_" + sanitizedFilename);
        try {
            file.transferTo(tempFile);
            // Create task
            SexEnum sexEnum = sex.equals(1) ? SexEnum.MALE : SexEnum.FEMALE;
            CreateTaskParam createTaskParam = CreateTaskParam.builder()
                    .sex(sexEnum.getValue())
                    .ageGroup(AgeGroupEnum.YOUTH.getValue())
                    .language(language)
                    .build();
            String taskResp = voiceTrainClient.createTask(createTaskParam);
            JSONObject taskObj = JSONObject.parseObject(taskResp);
            if (taskObj == null || !SUCCESS_CODE.equals(taskObj.get("code"))) {
                throw new BusinessException(ResponseEnum.SPEAKER_TRAIN_FAILED);
            }
            String taskId = taskObj.getString("data");

            // add audio
            AudioAddParam audioAddParam2 = AudioAddParam.builder()
                    .file(tempFile)
                    .taskId(taskId)
                    .textId(5001L)
                    .textSegId(segId)
                    .build();
            String submitWithAudio = voiceTrainClient.submitWithAudio(audioAddParam2);
            log.info("Task submission response: {}", submitWithAudio);

            // wait for training completion
            waitForTrainingCompletion(taskId, spaceId, uid);
            return taskId;
        } catch (Exception e) {
            log.error("create task failed", e);
            throw e;
        } finally {
            if (tempFile.exists() && !tempFile.delete()) {
                log.error("Failed to delete temporary file: {}", tempFile.getAbsolutePath());
            }
        }
    }

    @Override
    public JSONObject trainStatus(String taskId, Long spaceId, String uid) {
        try {
            String trainStatus = voiceTrainClient.result(taskId);
            if (StringUtils.isBlank(trainStatus)) {
                throw new BusinessException(ResponseEnum.OPERATION_FAILED);
            }
            JSONObject object = JSONObject.parseObject(trainStatus);
            if (object == null || !SUCCESS_CODE.equals(object.get("code"))) {
                throw new BusinessException(ResponseEnum.OPERATION_FAILED);
            }
            JSONObject data = object.getJSONObject("data");
            if (TRAIN_STATUS_SUCCESS.equals(data.getInteger("trainStatus"))) {
                // Save custom speaker
                CustomSpeaker customSpeaker = new CustomSpeaker();
                customSpeaker.setCreateUid(uid);
                customSpeaker.setSpaceId(spaceId);
                customSpeaker.setName("my_speaker_" + RandomUtil.randomString(5));
                customSpeaker.setAssetId(data.getString("assetId"));
                customSpeaker.setTaskId(taskId);
                customSpeakerService.save(customSpeaker);
            }
            return data;
        } catch (Exception e) {
            log.error("train status failed, taskId: {}", taskId, e);
        }
        return null;
    }

    /**
     * Sanitize filename to prevent path traversal attacks. Extracts only the filename part (not path)
     * and removes dangerous characters.
     *
     * @param originalFilename original filename from user input
     * @return sanitized filename safe for use in file operations
     */
    private String sanitizeFilename(String originalFilename) {
        if (StringUtils.isBlank(originalFilename)) {
            return "audio";
        }
        // Extract just the filename part (not the path) to prevent path traversal
        java.nio.file.Path fileNamePath = Paths.get(originalFilename).getFileName();
        // getFileName() can return null for root paths (e.g., "/", "C:\")
        if (fileNamePath == null) {
            return "audio";
        }
        String filename = fileNamePath.toString();
        // Remove dangerous characters: path separators, wildcards, and other special chars
        // Keep only alphanumeric, dots, dashes, and underscores
        String sanitized = filename.replaceAll("[^a-zA-Z0-9._-]", "_");
        // Prevent empty result or just dots
        if (sanitized.isEmpty() || sanitized.matches("^\\.+$")) {
            return "audio";
        }
        // Limit length to prevent excessively long filenames
        return sanitized.length() > 255 ? sanitized.substring(0, 255) : sanitized;
    }

    /**
     * Wait for training completion by polling task status
     */
    private void waitForTrainingCompletion(String taskId, Long spaceId, String uid) {
        log.info("Waiting for training completion, taskId: {}", taskId);

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                JSONObject statusResult = trainStatus(taskId, spaceId, uid);
                if (statusResult != null) {
                    Integer trainStatus = statusResult.getInteger("trainStatus");
                    log.info("Training status check attempt {}, taskId: {}, status: {}", attempt, taskId, trainStatus);

                    if (TRAIN_STATUS_SUCCESS.equals(trainStatus)) {
                        log.info("Training completed successfully, taskId: {}", taskId);
                        return;
                    } else if (TRAIN_STATUS_FAILED.equals(trainStatus) || TRAIN_STATUS_DRAFT.equals(trainStatus)) {
                        log.warn("Training failed, taskId: {}, status: {}", taskId, trainStatus);
                        throw new BusinessException(ResponseEnum.SPEAKER_TRAIN_FAILED, "Training failed");
                    }
                }

                if (attempt < MAX_RETRIES) {
                    Thread.sleep(RETRY_INTERVAL_MS);
                }

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("Training wait interrupted, taskId: {}", taskId, e);
                throw new BusinessException(ResponseEnum.OPERATION_FAILED, "Training interrupted");
            } catch (BusinessException e) {
                throw e;
            } catch (Exception e) {
                log.warn("Status check failed attempt {}, taskId: {}, error: {}", attempt, taskId, e.getMessage());
                if (attempt < MAX_RETRIES) {
                    try {
                        Thread.sleep(RETRY_INTERVAL_MS);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        log.error("Training wait interrupted, taskId: {}", taskId, ie);
                        throw new BusinessException(ResponseEnum.OPERATION_FAILED, "Training interrupted");
                    }
                }
            }
        }

        log.error("Training timeout, taskId: {}", taskId);
        throw new BusinessException(ResponseEnum.OPERATION_FAILED, "Training timeout");
    }
}
