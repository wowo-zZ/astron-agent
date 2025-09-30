package com.iflytek.astron.console.hub.service.workflow.impl;

import com.iflytek.astron.console.commons.enums.bot.BotPublishTypeEnum;
import com.iflytek.astron.console.commons.service.data.UserLangChainDataService;
import com.iflytek.astron.console.toolkit.entity.table.workflow.WorkflowVersion;
import com.iflytek.astron.console.toolkit.mapper.workflow.WorkflowVersionMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.iflytek.astron.console.hub.dto.workflow.WorkflowReleaseRequestDto;
import com.iflytek.astron.console.hub.dto.workflow.WorkflowReleaseResponseDto;
import com.iflytek.astron.console.hub.service.workflow.WorkflowReleaseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import okhttp3.*;

import java.time.Duration;

/**
 * Workflow release service implementation Simplified version: no approval process, direct publish
 * and sync
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowReleaseServiceImpl implements WorkflowReleaseService {

    private final UserLangChainDataService userLangChainDataService;
    private final WorkflowVersionMapper workflowVersionMapper;

    // Workflow version management base URL
    @Value("${maas.workflowVersion}")
    private String baseUrl;

    // MAAS API configuration
    @Value("${maas.publishApi}")
    private String massPublishApi;

    @Value("${maas.authApi}")
    private String massAuthApi;

    // API endpoints for workflow version management
    private static final String ADD_VERSION_URL = ""; // Create new version
    private static final String UPDATE_RESULT_URL = "/update_channel_result"; // Update audit result
    private static final String GET_VERSION_NAME_URL = "/getVersionName"; // Get next version name

    // Release status constants (reserved for future use)
    @SuppressWarnings("unused")
    private static final String RELEASE_SUCCESS = "成功";
    @SuppressWarnings("unused")
    private static final String RELEASE_FAIL = "失败";

    // HTTP client configuration
    private static final MediaType JSON_MEDIA_TYPE = MediaType.get("application/json; charset=utf-8");
    private final OkHttpClient okHttpClient = new OkHttpClient.Builder()
            .connectTimeout(Duration.ofSeconds(30))
            .readTimeout(Duration.ofSeconds(60))
            .writeTimeout(Duration.ofSeconds(60))
            .build();

    // TODO: Inject actual workflow version management service and API sync service
    // private final WorkflowVersionService workflowVersionService;
    // private final ApiSyncService apiSyncService;
    // private final WorkflowReleaseCallbackMapper workflowReleaseCallbackMapper;

    @Override
    public WorkflowReleaseResponseDto publishWorkflow(Integer botId, String uid, Long spaceId, String publishType) {
        log.info("Starting workflow bot publish: botId={}, uid={}, spaceId={}, publishType={}",
                botId, uid, spaceId, publishType);

        try {
            // 1. Get flowId
            String flowId = userLangChainDataService.findFlowIdByBotId(botId);
            if (!StringUtils.hasText(flowId)) {
                log.error("Failed to get flowId by botId: botId={}", botId);
                return createErrorResponse("Unable to get workflow ID");
            }

            // 2. Get version name for new release
            String versionName = getNextVersionName(flowId, spaceId);
            if (!StringUtils.hasText(versionName)) {
                log.error("Failed to get version name by flowId: flowId={}", flowId);
                return createErrorResponse("Unable to get version name");
            }

            // 3. Check if version already exists
            if (isVersionExists(botId, versionName)) {
                log.info("Version already exists, skipping publish: botId={}, versionName={}", botId, versionName);
                return createSuccessResponse(null, versionName);
            }

            // 4. Create workflow version record
            WorkflowReleaseRequestDto request = new WorkflowReleaseRequestDto();
            request.setBotId(botId.toString());
            request.setFlowId(flowId);
            request.setPublishChannel(getPublishChannelCode(publishType));
            // Set to success directly, no approval needed
            request.setPublishResult("成功");
            request.setDescription("");
            request.setName(versionName);

            WorkflowReleaseResponseDto response = createWorkflowVersion(request);
            if (!response.getSuccess()) {
                return response;
            }

            // 5. Sync to API system directly (no approval needed)
            String appId = getAppIdByBotId(botId);
            syncToApiSystem(botId, flowId, versionName, appId);

            // 6. Update audit result to success
            updateAuditResult(response.getWorkflowVersionId(), "成功");

            log.info("Workflow bot publish and sync successful: botId={}, versionId={}, versionName={}",
                    botId, response.getWorkflowVersionId(), response.getWorkflowVersionName());

            return response;

        } catch (Exception e) {
            log.error("Workflow bot publish failed: botId={}, uid={}, spaceId={}", botId, uid, spaceId, e);
            return createErrorResponse("Publish failed: " + e.getMessage());
        }
    }

    /**
     * Get next version name for workflow release This method calls the workflow service to generate the
     * next version name for a new release
     */
    private String getNextVersionName(String flowId, Long spaceId) {
        log.info("Getting next workflow version name: flowId={}, spaceId={}", flowId, spaceId);

        try {
            // Build request parameters
            JSONObject requestBody = new JSONObject();
            requestBody.put("flowId", flowId);

            String jsonBody = requestBody.toJSONString();

            // Send request using OkHttp
            Request.Builder requestBuilder = new Request.Builder()
                    .url(baseUrl + GET_VERSION_NAME_URL)
                    .post(RequestBody.create(jsonBody, JSON_MEDIA_TYPE))
                    .addHeader("Content-Type", "application/json");

            // Add spaceId to header
            if (spaceId != null) {
                requestBuilder.addHeader("space-id", spaceId.toString());
            }

            try (Response response = okHttpClient.newCall(requestBuilder.build()).execute()) {
                if (!response.isSuccessful()) {
                    log.error("Failed to get next version name: flowId={}, responseCode={}", flowId, response.code());
                    // Fallback strategy - generate timestamp-based version
                    return "v" + System.currentTimeMillis();
                }

                String responseBody = response.body().string();
                log.debug("Get next version name response: {}", responseBody);

                // Parse response
                JSONObject responseJson = JSON.parseObject(responseBody);
                JSONObject data = responseJson.getJSONObject("data");

                if (data != null && data.containsKey("workflowVersionName")) {
                    String versionName = data.getString("workflowVersionName");
                    log.info("Successfully got next version name: flowId={}, versionName={}", flowId, versionName);
                    return versionName;
                }

                log.warn("Version name not found in response: flowId={}", flowId);
                // Fallback strategy - generate timestamp-based version
                return "v" + System.currentTimeMillis();
            }

        } catch (Exception e) {
            log.error("Exception occurred while getting next workflow version name: flowId={}, spaceId={}", flowId, spaceId, e);
            // Fallback strategy - generate timestamp-based version
            return "v" + System.currentTimeMillis();
        }
    }

    private boolean isVersionExists(Integer botId, String versionName) {
        // TODO: Implement logic to check if version exists
        log.info("Checking if version exists: botId={}, versionName={}", botId, versionName);
        // Temporarily return false
        return false;
    }

    private WorkflowReleaseResponseDto createWorkflowVersion(WorkflowReleaseRequestDto request) {
        log.info("Creating workflow version: request={}", request);

        try {
            String jsonBody = JSON.toJSONString(request);

            // Send request using OkHttp
            Request httpRequest = new Request.Builder()
                    .url(baseUrl + ADD_VERSION_URL)
                    .post(RequestBody.create(jsonBody, JSON_MEDIA_TYPE))
                    .addHeader("Content-Type", "application/json")
                    .build();

            try (Response response = okHttpClient.newCall(httpRequest).execute()) {
                if (!response.isSuccessful()) {
                    log.error("Failed to create workflow version: statusCode={}, response={}",
                            response.code(), response.body().string());
                    return createErrorResponse("Failed to create version: HTTP " + response.code());
                }

                String responseBody = response.body().string();
                log.debug("Create workflow version response: {}", responseBody);

                // Parse response
                JSONObject responseJson = JSON.parseObject(responseBody);
                JSONObject data = responseJson.getJSONObject("data");

                if (data != null) {
                    WorkflowReleaseResponseDto result = new WorkflowReleaseResponseDto();
                    result.setSuccess(true);

                    // 提取版本ID和版本名称
                    if (data.containsKey("workflowVersionId")) {
                        result.setWorkflowVersionId(data.getLong("workflowVersionId"));
                    }

                    if (data.containsKey("workflowVersionName")) {
                        result.setWorkflowVersionName(data.getString("workflowVersionName"));
                    } else {
                        result.setWorkflowVersionName(request.getName());
                    }

                    log.info("创建工作流版本成功: versionId={}, versionName={}",
                            result.getWorkflowVersionId(), result.getWorkflowVersionName());
                    return result;
                }

                return createErrorResponse("响应数据格式错误");
            }

        } catch (Exception e) {
            log.error("创建工作流版本异常: request={}", request, e);
            return createErrorResponse("创建版本异常: " + e.getMessage());
        }
    }

    private void syncToApiSystem(Integer botId, String flowId, String versionName, String appId) {
        log.info("同步工作流到API系统: botId={}, flowId={}, versionName={}, appId={}",
                botId, flowId, versionName, appId);

        try {
            // 1. 首先获取版本的系统数据
            JSONObject versionData = getVersionSysData(botId, versionName);
            if (versionData == null) {
                log.error("获取版本系统数据失败: botId={}, versionName={}", botId, versionName);
                return;
            }

            // 2. Build Mass API request parameters
            JSONObject massApiRequest = new JSONObject();
            massApiRequest.put("flowId", flowId);
            massApiRequest.put("appId", appId);
            massApiRequest.put("version", versionName);
            massApiRequest.put("data", versionData);

            String jsonBody = massApiRequest.toJSONString();

            // 3. 发布API到Mass系统
            Request publishRequest = new Request.Builder()
                    .url(massPublishApi)
                    .post(RequestBody.create(jsonBody, JSON_MEDIA_TYPE))
                    .addHeader("Content-Type", "application/json")
                    .addHeader("X-Consumer-Username", "workflow-publisher") // 模拟消费者ID
                    .build();

            try (Response response = okHttpClient.newCall(publishRequest).execute()) {
                if (!response.isSuccessful()) {
                    log.error("发布Mass API失败: botId={}, responseCode={}, response={}",
                            botId, response.code(), response.body().string());
                    return;
                }

                String responseBody = response.body().string();
                log.debug("发布Mass API响应: {}", responseBody);

                // 解析响应检查是否成功
                JSONObject responseJson = JSON.parseObject(responseBody);
                Integer code = responseJson.getInteger("code");

                if (code != null && code.equals(0)) {
                    log.info("同步工作流到API系统成功: botId={}, flowId={}, versionName={}",
                            botId, flowId, versionName);
                } else {
                    log.error("发布Mass API失败: botId={}, response={}", botId, responseBody);
                }
            }

        } catch (Exception e) {
            log.error("同步工作流到API系统异常: botId={}, flowId={}, versionName={}, appId={}",
                    botId, flowId, versionName, appId, e);
        }
    }

    /**
     * Get version system data from database
     */
    private JSONObject getVersionSysData(Integer botId, String versionName) {
        try {
            log.info("Getting version system data from database: botId={}, versionName={}", botId, versionName);

            // Query database for workflow version
            LambdaQueryWrapper<WorkflowVersion> queryWrapper = new LambdaQueryWrapper<WorkflowVersion>()
                    .eq(WorkflowVersion::getBotId, botId.toString())
                    .eq(WorkflowVersion::getName, versionName)
                    .last("LIMIT 1");

            WorkflowVersion workflowVersion = workflowVersionMapper.selectOne(queryWrapper);

            if (workflowVersion == null) {
                log.warn("Workflow version not found in database: botId={}, versionName={}", botId, versionName);
                return new JSONObject(); // Return empty object as fallback
            }

            String sysData = workflowVersion.getSysData();
            if (sysData != null && !sysData.trim().isEmpty()) {
                try {
                    return JSON.parseObject(sysData);
                } catch (Exception e) {
                    log.error("Failed to parse sysData JSON: botId={}, versionName={}, sysData={}",
                            botId, versionName, sysData, e);
                    return new JSONObject(); // Return empty object as fallback
                }
            }

            log.warn("SysData is empty for version: botId={}, versionName={}", botId, versionName);
            return new JSONObject(); // Return empty object as fallback

        } catch (Exception e) {
            log.error("Exception occurred while getting version system data: botId={}, versionName={}",
                    botId, versionName, e);
            return new JSONObject(); // Return empty object as fallback
        }
    }

    /**
     * Update audit result
     */
    private boolean updateAuditResult(Long versionId, String auditResult) {
        if (versionId == null) {
            log.warn("Version ID is null, skipping audit result update");
            return false;
        }

        try {
            log.info("Updating audit result: versionId={}, auditResult={}", versionId, auditResult);

            // Build request parameters
            JSONObject requestBody = new JSONObject();
            requestBody.put("id", versionId);
            requestBody.put("publishResult", auditResult);

            String jsonBody = requestBody.toJSONString();

            // Send request using OkHttp
            Request httpRequest = new Request.Builder()
                    .url(baseUrl + UPDATE_RESULT_URL)
                    .post(RequestBody.create(jsonBody, JSON_MEDIA_TYPE))
                    .addHeader("Content-Type", "application/json")
                    .build();

            try (Response response = okHttpClient.newCall(httpRequest).execute()) {
                if (!response.isSuccessful()) {
                    log.error("Failed to update audit result: versionId={}, auditResult={}, responseCode={}",
                            versionId, auditResult, response.code());
                    return false;
                }

                String responseBody = response.body().string();
                log.debug("Update audit result response: {}", responseBody);

                // Parse response to check result
                JSONObject responseJson = JSON.parseObject(responseBody);
                Integer code = responseJson.getInteger("code");

                if (code != null && code.equals(0)) {
                    log.info("Successfully updated audit result: versionId={}, auditResult={}", versionId, auditResult);
                    return true;
                } else {
                    log.error("Failed to update audit result: versionId={}, auditResult={}, response={}",
                            versionId, auditResult, responseBody);
                    return false;
                }
            }

        } catch (Exception e) {
            log.error("Exception occurred while updating audit result: versionId={}, auditResult={}",
                    versionId, auditResult, e);
            return false;
        }
    }

    /**
     * Get publish channel code
     */
    private Integer getPublishChannelCode(String publishType) {
        BotPublishTypeEnum publishTypeEnum = BotPublishTypeEnum.getByCode(publishType);
        if (publishTypeEnum != null) {
            return publishTypeEnum.getChannelCode();
        }
        // Default to market
        return BotPublishTypeEnum.MARKET.getChannelCode();
    }

    /**
     * Get appId by botId
     */
    private String getAppIdByBotId(Integer botId) {
        // TODO: Implement logic to get appId
        return "app_" + botId;
    }

    /**
     * Create success response
     */
    private WorkflowReleaseResponseDto createSuccessResponse(Long versionId, String versionName) {
        WorkflowReleaseResponseDto response = new WorkflowReleaseResponseDto();
        response.setSuccess(true);
        response.setWorkflowVersionId(versionId);
        response.setWorkflowVersionName(versionName);
        return response;
    }

    /**
     * Create error response
     */
    private WorkflowReleaseResponseDto createErrorResponse(String errorMessage) {
        WorkflowReleaseResponseDto response = new WorkflowReleaseResponseDto();
        response.setSuccess(false);
        response.setErrorMessage(errorMessage);
        return response;
    }
}
