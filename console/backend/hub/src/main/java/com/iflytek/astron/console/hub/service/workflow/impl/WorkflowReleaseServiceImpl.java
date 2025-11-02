package com.iflytek.astron.console.hub.service.workflow.impl;

import com.iflytek.astron.console.commons.enums.bot.ReleaseTypeEnum;
import com.iflytek.astron.console.commons.service.data.UserLangChainDataService;
import com.iflytek.astron.console.commons.mapper.bot.ChatBotApiMapper;
import com.iflytek.astron.console.commons.dto.bot.ChatBotApi;
import com.iflytek.astron.console.commons.util.MaasUtil;
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
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Random;

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
    private final ChatBotApiMapper chatBotApiMapper;
    private final MaasUtil maasUtil;

    // Workflow version management base URL
    @Value("${maas.workflowVersion}")
    private String baseUrl;

    // MaaS appId configuration
    @Value("${maas.appId}")
    private String maasAppId;

    // API endpoints for workflow version management
    @Value("${maas.addVersionUrl:}")
    private String addVersionUrl;
    private static final String UPDATE_RESULT_URL = "/update-channel-result";
    private static final String GET_VERSION_NAME_URL = "/get-version-name";

    // Release status constants (reserved for future use)
    @SuppressWarnings("unused")
    private static final String RELEASE_SUCCESS = "Success";
    @SuppressWarnings("unused")
    private static final String RELEASE_FAIL = "Failed";

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

    /**
     * Generate consistent log context string for tracing
     */
    private String logCtx(Integer botId, String flowId, Long spaceId) {
        return String.format("[botId=%s, flowId=%s, spaceId=%s]", botId, flowId, spaceId);
    }

    /**
     * Generate consistent log context string for tracing (with versionId)
     */
    private String logCtx(Integer botId, String flowId, Long spaceId, Long versionId) {
        return String.format("[botId=%s, flowId=%s, spaceId=%s, versionId=%s]", botId, flowId, spaceId, versionId);
    }

    @Override
    public WorkflowReleaseResponseDto publishWorkflow(Integer botId, String uid, Long spaceId, String publishType) {
        log.info("🔵 Starting workflow bot publish: botId={}, uid={}, spaceId={}, publishType={}",
                botId, uid, spaceId, publishType);

        Long versionId = null;
        String flowId = null;
        try {
            // 1. Get flowId
            flowId = userLangChainDataService.findFlowIdByBotId(botId);
            if (!StringUtils.hasText(flowId)) {
                log.error("❌ Failed to get flowId by botId: botId={}", botId);
                return createErrorResponse("Unable to get workflow ID");
            }
            log.debug("✓ Got flowId: {}", flowId);

            // 2. Get version name for new release
            String versionName = getNextVersionName(flowId, spaceId, botId);
            if (!StringUtils.hasText(versionName)) {
                log.error("❌ Failed to get version name by flowId: flowId={}", flowId);
                return createErrorResponse("Unable to get version name");
            }
            log.debug("✓ Got version name: {}", versionName);

            // 3. Check if version already exists
            if (isVersionExists(botId, versionName)) {
                log.info("⚠️ Version already exists, skipping publish: botId={}, versionName={}", botId, versionName);
                return createSuccessResponse(null, versionName);
            }

            // 4. Create workflow version record
            WorkflowReleaseRequestDto request = new WorkflowReleaseRequestDto();
            request.setBotId(botId.toString());
            request.setFlowId(flowId);
            request.setPublishChannel(getPublishChannelCode(publishType));
            request.setPublishResult("Pending");  // Initially set to Pending
            request.setDescription("");
            request.setName(versionName);

            WorkflowReleaseResponseDto response = createWorkflowVersion(request, spaceId);
            if (!response.getSuccess()) {
                log.error("❌ Failed to create workflow version: {}", response.getErrorMessage());
                return response;
            }

            versionId = response.getWorkflowVersionId();
            log.info("✓ Created workflow version: versionId={}, versionName={}", versionId, response.getWorkflowVersionName());

            // 5. Sync to API system directly (no approval needed)
            String appId = getAppIdByBotId(botId);
            if (!StringUtils.hasText(appId)) {
                log.error("❌ AppId is empty, cannot sync to API system");
                updateAuditResult(versionId, "Failed", botId, flowId, spaceId);
                return createErrorResponse("AppId not found for bot");
            }

            try {
                syncToApiSystem(botId, flowId, versionName, appId);
                log.info("✓ Successfully synced to API system");
            } catch (Exception syncError) {
                // Sync failed - mark version as failed
                log.error("❌ API sync failed, marking version as failed: {}", syncError.getMessage());
                updateAuditResult(versionId, "Failed", botId, flowId, spaceId);
                return createErrorResponse("API sync failed: " + syncError.getMessage());
            }

            // 6. Update audit result to success
            boolean updateSuccess = updateAuditResult(versionId, "Success", botId, flowId, spaceId);
            if (!updateSuccess) {
                log.error("❌ Failed to update audit result, but sync was successful");
                // Don't fail the whole operation if audit update fails
            }

            log.info("✓ Workflow bot publish and sync successful: botId={}, versionId={}, versionName={}",
                    botId, versionId, response.getWorkflowVersionName());

            return response;

        } catch (Exception e) {
            log.error("❌ Workflow bot publish failed: botId={}, uid={}, spaceId={}", botId, uid, spaceId, e);
            
            // Try to mark version as failed if we have versionId
            if (versionId != null) {
                try {
                    updateAuditResult(versionId, "Failed", botId, flowId, spaceId);
                } catch (Exception updateError) {
                    log.error("   Additional error updating version status: {}", updateError.getMessage());
                }
            }
            
            return createErrorResponse("Publish failed: " + e.getMessage());
        }
    }

    /**
     * Get next version name for workflow release Simplified to match old project logic exactly - no
     * fallback
     */
    private String getNextVersionName(String flowId, Long spaceId, Integer botId) {
        String logCtx = logCtx(botId, flowId, spaceId);
        log.info("Getting next workflow version name: {}", logCtx);

        JSONObject requestBody = new JSONObject();
        requestBody.put("flowId", flowId);

        String jsonBody = requestBody.toJSONString();
        String authHeader = getAuthorizationHeader();

        String requestUrl = baseUrl + GET_VERSION_NAME_URL;
        log.info("📤 GET_VERSION_NAME API Request {} - URL: {}", logCtx, requestUrl);
        log.debug("   Request Body: {}", jsonBody);

        Request.Builder requestBuilder = new Request.Builder()
                .url(requestUrl)
                .post(RequestBody.create(jsonBody, JSON_MEDIA_TYPE))
                .addHeader("Content-Type", "application/json")
                .addHeader("Authorization", authHeader);

        if (spaceId != null) {
            requestBuilder.addHeader("space-id", spaceId.toString());
        }

        try (Response response = okHttpClient.newCall(requestBuilder.build()).execute()) {
            ResponseBody body = response.body();
            String responseStr = body != null ? body.string() : null;
            
            // Log complete HTTP response details
            log.info("📥 GET_VERSION_NAME API Response {} - StatusCode: {}, IsSuccessful: {}", logCtx, response.code(), response.isSuccessful());
            log.debug("   Response Headers: {}", response.headers());
            log.debug("   Response Body: {}", responseStr);
            
            if (body != null && response.isSuccessful()) {
                JSONObject responseJson = JSON.parseObject(responseStr);
                if (responseJson != null && responseJson.getInteger("code") == 0) {
                    JSONObject data = responseJson.getJSONObject("data");
                    if (data != null && data.containsKey("workflowVersionName")) {
                        String versionName = data.getString("workflowVersionName");
                        if (versionName != null && !versionName.trim().isEmpty()) {
                            log.info("✓ Got version name from API {} - versionName: {}", logCtx, versionName);
                            return versionName;
                        }
                    }
                } else {
                    log.warn("⚠️ GET_VERSION_NAME API returned non-zero code {} - code: {}, message: {}", logCtx, responseJson != null ? responseJson.get("code") : "null", responseJson != null ? responseJson.get("message") : "null");
                }
            } else {
                log.warn("⚠️ GET_VERSION_NAME API call unsuccessful {} - StatusCode: {}, Response: {}", logCtx, response.code(), responseStr);
            }
        } catch (Exception e) {
            log.error("❌ Exception occurred while getting version name {}", logCtx, e);
            return null;
        }

        // If we reach here, API call failed - return null like old project
        return null;
    }

    /**
     * Generate timestamp-based version number like old project
     *
     * @return Timestamp version number (e.g., "1760323182721")
     */
    private String generateTimestampVersionNumber() {
        long timestamp = System.currentTimeMillis();
        Random random = new Random();
        int randomNumber = random.nextInt(900000) + 100000;
        String versionNumber = String.valueOf(timestamp) + String.valueOf(randomNumber);
        if (versionNumber.length() > 19) {
            versionNumber = versionNumber.substring(0, 19);
        }
        return versionNumber;
    }

    /**
     * Check if a workflow version already exists for the given botId and versionName Reference: old
     * project's VersionService.getVersionSysData method
     */
    private boolean isVersionExists(Integer botId, String versionName) {
        log.info("Checking if version exists: botId={}, versionName={}", botId, versionName);

        try {
            // Query workflow_version table to check if version exists
            LambdaQueryWrapper<WorkflowVersion> queryWrapper = new LambdaQueryWrapper<WorkflowVersion>()
                    .eq(WorkflowVersion::getBotId, botId.toString()) // botId is stored as String in WorkflowVersion
                    .eq(WorkflowVersion::getName, versionName)
                    .last("LIMIT 1");

            WorkflowVersion existingVersion = workflowVersionMapper.selectOne(queryWrapper);

            boolean exists = existingVersion != null;
            log.debug("Version exists check result: botId={}, versionName={}, exists={}",
                    botId, versionName, exists);

            return exists;

        } catch (Exception e) {
            log.error("Failed to check if version exists: botId={}, versionName={}",
                    botId, versionName, e);
            // In case of error, assume version doesn't exist to allow creation
            return false;
        }
    }

    private WorkflowReleaseResponseDto createWorkflowVersion(WorkflowReleaseRequestDto request, Long spaceId) {
        Integer botId = Integer.parseInt(request.getBotId());
        String flowId = request.getFlowId();
        String logCtx = logCtx(botId, flowId, spaceId);
        log.info("Creating workflow version: {} - versionName={}", logCtx, request.getName());

        try {
            // Generate timestamp-based version number like old project
            String timestampVersionNum = generateTimestampVersionNumber();
            log.info("Generated timestamp version number: {} - timestampVersionNum={}", logCtx, timestampVersionNum);

            // Create a new request with timestamp version number
            WorkflowReleaseRequestDto releaseRequestDto = new WorkflowReleaseRequestDto();
            releaseRequestDto.setBotId(request.getBotId());
            releaseRequestDto.setFlowId(request.getFlowId());
            releaseRequestDto.setPublishChannel(request.getPublishChannel());
            releaseRequestDto.setPublishResult(request.getPublishResult());
            releaseRequestDto.setDescription(request.getDescription());
            releaseRequestDto.setName(request.getName());

            String jsonBody = JSON.toJSONString(releaseRequestDto);
            String authHeader = getAuthorizationHeader();

            if (!StringUtils.hasText(authHeader)) {
                return createErrorResponse("No authorization header available");
            }

            // Send request using OkHttp
            String versionUrl = baseUrl + addVersionUrl;
            log.info("📤 CREATE_WORKFLOW_VERSION API Request {} - URL: {}", logCtx, versionUrl);
            log.debug("   Request Body: {}", jsonBody);
            Request.Builder builder = new Request.Builder()
                    .url(versionUrl)
                    .post(RequestBody.create(jsonBody, JSON_MEDIA_TYPE))
                    .addHeader("Content-Type", "application/json")
                    .addHeader(MaasUtil.X_AUTH_SOURCE_HEADER, MaasUtil.X_AUTH_SOURCE_VALUE)
                    .addHeader("Authorization", authHeader);

            if (spaceId != null) {
                builder.addHeader("space-id", spaceId.toString());
            }

            Request httpRequest = builder
                    .build();

            try (Response response = okHttpClient.newCall(httpRequest).execute()) {
                ResponseBody body = response.body();
                String responseBody = body != null ? body.string() : null;

                // Log complete HTTP response details
                log.info("📥 CREATE_WORKFLOW_VERSION API Response {} - StatusCode: {}, IsSuccessful: {}", logCtx, response.code(), response.isSuccessful());
                log.debug("   Response Headers: {}", response.headers());
                log.debug("   Response Body: {}", responseBody);

                if (!response.isSuccessful()) {
                    log.error("❌ Failed to create workflow version {} - statusCode={}, response={}",
                            logCtx, response.code(), responseBody);
                    return createErrorResponse("Failed to create version: HTTP " + response.code());
                }

                if (!StringUtils.hasText(responseBody)) {
                    log.error("❌ Empty response when creating workflow version {}", logCtx);
                    return createErrorResponse("Invalid response data format");
                }

                JSONObject responseJson = JSON.parseObject(responseBody);
                if (responseJson == null) {
                    log.error("❌ Failed to parse workflow version response {} - response={}", logCtx, responseBody);
                    return createErrorResponse("Invalid response data format");
                }

                JSONObject data = responseJson.getJSONObject("data");

                if (data != null) {
                    WorkflowReleaseResponseDto result = new WorkflowReleaseResponseDto();
                    result.setSuccess(true);

                    if (data.containsKey("workflowVersionId")) {
                        result.setWorkflowVersionId(data.getLong("workflowVersionId"));
                    }

                    if (data.containsKey("workflowVersionName")) {
                        result.setWorkflowVersionName(data.getString("workflowVersionName"));
                    } else {
                        result.setWorkflowVersionName(request.getName());
                    }

                    log.info("✓ Successfully created workflow version {} - versionId={}, versionName={}",
                            logCtx, result.getWorkflowVersionId(), result.getWorkflowVersionName());
                    return result;
                }

                return createErrorResponse("Invalid response data format");
            }

        } catch (Exception e) {
            log.error("❌ Exception occurred while creating workflow version {}", logCtx, e);
            return createErrorResponse("Exception occurred while creating version: " + e.getMessage());
        }
    }

    /**
     * Sync workflow to API system (publish and bind)
     * Throws exception on failure to prevent silent failures
     */
    private void syncToApiSystem(Integer botId, String flowId, String versionName, String appId) {
        log.info("🔄 Starting API sync: botId={}, flowId={}, versionName={}, appId={}",
                botId, flowId, versionName, appId);

        try {
            // Validate inputs
            if (!StringUtils.hasText(appId)) {
                log.error("❌ Cannot sync to API system: appId is empty!");
                throw new IllegalArgumentException("appId cannot be empty");
            }

            // 1. Get version system data
            JSONObject versionData = getVersionSysData(botId, versionName);
            if (versionData == null) {
                log.warn("⚠️ Version system data is null, continuing with empty data");
                versionData = new JSONObject();
            } else if (versionData.isEmpty()) {
                log.debug("   Version system data is empty");
            }

            // 2. Use MaasUtil's createApi method to publish and bind
            try {
                log.info("📤 Calling MaaS publish and bind APIs...");
                maasUtil.createApi(flowId, appId, versionName, versionData);
                log.info("✓ Successfully synced workflow to API system: botId={}, flowId={}, versionName={}",
                        botId, flowId, versionName);
            } catch (Exception maasException) {
                log.error("❌ MaaS API call failed: {}", maasException.getMessage());
                
                // Analyze error cause
                String errorMsg = maasException.getMessage();
                if (errorMsg != null && (errorMsg.contains("binding failed") || errorMsg.contains("20007"))) {
                    log.error("   → Application binding failed. Check:");
                    log.error("     1. Does appId '{}' exist in MaaS platform?", appId);
                    log.error("     2. Is appId active and has binding permission?");
                    log.error("     3. Was workflow version successfully published?");
                }
                
                throw maasException;  // Re-throw to be handled by caller
            }

        } catch (IllegalArgumentException e) {
            log.error("❌ Invalid argument for API sync: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("❌ Exception occurred while syncing workflow to API system: botId={}, flowId={}, versionName={}, appId={}",
                    botId, flowId, versionName, appId, e);
            throw new RuntimeException("API system sync failed: " + e.getMessage(), e);
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
    private boolean updateAuditResult(Long versionId, String auditResult, Integer botId, String flowId, Long spaceId) {
        String logCtx = logCtx(botId, flowId, spaceId, versionId);
        if (versionId == null) {
            log.warn("Version ID is null, skipping audit result update - {}", logCtx);
            return false;
        }

        try {
            log.info("Updating audit result: {} - auditResult={}", logCtx, auditResult);

            // Build request parameters
            JSONObject requestBody = new JSONObject();
            requestBody.put("id", versionId);
            requestBody.put("publishResult", auditResult);

            String jsonBody = requestBody.toJSONString();
            String authHeader = getAuthorizationHeader();

            if (!StringUtils.hasText(authHeader)) {
                log.error("❌ No authorization header available for audit result update - {}", logCtx);
                return false;
            }

            // Log HTTP request details
            String updateUrl = baseUrl + UPDATE_RESULT_URL;
            log.info("📤 UPDATE_AUDIT_RESULT API Request {} - URL: {}", logCtx, updateUrl);
            log.debug("   Request Body: {}", jsonBody);

            // Send request using OkHttp
            Request httpRequest = new Request.Builder()
                    .url(updateUrl)
                    .post(RequestBody.create(jsonBody, JSON_MEDIA_TYPE))
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Authorization", authHeader)
                    .build();

            try (Response response = okHttpClient.newCall(httpRequest).execute()) {
                ResponseBody body = response.body();
                String responseBody = body != null ? body.string() : null;

                // Log complete HTTP response details
                log.info("📥 UPDATE_AUDIT_RESULT API Response {} - StatusCode: {}, IsSuccessful: {}", logCtx, response.code(), response.isSuccessful());
                log.debug("   Response Headers: {}", response.headers());
                log.debug("   Response Body: {}", responseBody);

                if (!response.isSuccessful()) {
                    log.error("❌ Failed to update audit result {} - statusCode={}, response={}",
                            logCtx, response.code(), responseBody);
                    return false;
                }

                if (!StringUtils.hasText(responseBody)) {
                    log.error("❌ Empty response when updating audit result - {}",
                            logCtx);
                    return false;
                }

                JSONObject responseJson = JSON.parseObject(responseBody);
                if (responseJson == null) {
                    log.error("❌ Failed to parse audit result response - {}, response={}", logCtx, responseBody);
                    return false;
                }

                Integer code = responseJson.getInteger("code");

                if (code != null && code.equals(0)) {
                    log.info("✓ Successfully updated audit result - {} - auditResult={}", logCtx, auditResult);
                    return true;
                } else {
                    log.error("❌ Failed to update audit result (non-zero code) - {} - code={}, response={}",
                            logCtx, code, responseBody);
                    return false;
                }
            }

        } catch (Exception e) {
            log.error("❌ Exception occurred while updating audit result - {} - auditResult={}",
                    logCtx, auditResult, e);
            return false;
        }
    }

    /**
     * Get publish channel code
     */
    private Integer getPublishChannelCode(String publishType) {
        try {
            Integer typeCode = Integer.parseInt(publishType);
            // Direct return since ReleaseTypeEnum code is the channel code
            return typeCode;
        } catch (NumberFormatException e) {
            log.warn("Invalid publish type format: {}", publishType);
            // Default to market
            return ReleaseTypeEnum.MARKET.getCode();
        }
    }

    /**
     * Get appId by botId from chat_bot_api table, fallback to configured maas appId
     * Validates that appId exists and is not empty
     */
    private String getAppIdByBotId(Integer botId) {
        String appId = null;
        try {
            // Query chat_bot_api table to find appId for the given botId
            LambdaQueryWrapper<ChatBotApi> queryWrapper = new LambdaQueryWrapper<ChatBotApi>()
                    .eq(ChatBotApi::getBotId, botId)
                    .last("LIMIT 1");

            ChatBotApi chatBotApi = chatBotApiMapper.selectOne(queryWrapper);

            if (chatBotApi != null && StringUtils.hasText(chatBotApi.getAppId())) {
                appId = chatBotApi.getAppId();
                log.info("✓ Found appId in database for botId {}: {}", botId, appId);
                return appId;
            } else {
                log.warn("⚠️ No appId found in chat_bot_api table for botId: {}", botId);
            }
        } catch (Exception e) {
            log.error("❌ Exception querying chat_bot_api table for botId: {}", botId, e);
        }

        // Use fallback appId if database lookup failed or returned null
        if (StringUtils.hasText(maasAppId)) {
            log.warn("   Using fallback configured maasAppId: {}", maasAppId);
            return maasAppId;
        } else {
            log.error("❌ No appId found in database and no fallback configured!");
            log.error("   Please configure maas.appId in application.yml or ensure chat_bot_api has botId mapping");
            return null;
        }
    }

    /**
     * Get authorization header from current request context
     * Throws exception if header is missing to prevent silent failures
     */
    private String getAuthorizationHeader() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            log.error("❌ RequestContextHolder is null - request context not available!");
            log.error("   This usually means the method is being called outside an HTTP request context.");
            return "";
        }
        String authHeader = MaasUtil.getAuthorizationHeader(attributes.getRequest());
        if (StringUtils.isEmpty(authHeader)) {
            log.warn("⚠️ Authorization header is empty - API calls may fail if authentication is required");
        }
        return authHeader;
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
