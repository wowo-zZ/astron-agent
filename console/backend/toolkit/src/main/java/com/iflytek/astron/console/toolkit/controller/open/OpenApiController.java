package com.iflytek.astron.console.toolkit.controller.open;

import com.alibaba.fastjson2.JSONObject;
import com.iflytek.astron.console.commons.constant.ResponseEnum;
import com.iflytek.astron.console.commons.exception.BusinessException;
import com.iflytek.astron.console.commons.response.ApiResult;
import com.iflytek.astron.console.toolkit.common.CustomExceptionCode;
import com.iflytek.astron.console.toolkit.common.anno.ResponseResultBody;
import com.iflytek.astron.console.toolkit.config.exception.CustomException;
import com.iflytek.astron.console.toolkit.entity.dto.openapi.WorkflowIoTransRequest;
import com.iflytek.astron.console.toolkit.service.openapi.OpenApiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Open API Controller for external service integration
 */
@RestController
@RequestMapping("/api/v1/agent")
@Slf4j
@ResponseResultBody
@Tag(name = "Open API interface")
public class OpenApiController {

    @Autowired
    private OpenApiService openApiService;

    private static final String AUTHORIZATION_PREFIX = "Bearer ";

    /**
     * Get workflow IO transformation data by API key
     *
     * @param akAs Authorization header in format "Bearer apiKey:apiSecret"
     * @return List of IO transformation data
     */
    @GetMapping("/io-params")
    @Operation(summary = "Get workflow IO transformations",
            description = "Retrieve workflow IO transformation data using API key authentication")
    public ApiResult<List<JSONObject>> getWorkflowIoInfoList(
            @RequestHeader("AkAs") String akAs) {

        // Parse authorization header
        if (!StringUtils.hasText(akAs) || !akAs.startsWith("Bearer ")) {
            throw new BusinessException(ResponseEnum.OPENAPI_MISSING_AUTH_INFO);
        }

        String credentials = akAs.substring(AUTHORIZATION_PREFIX.length());
        String[] parts = credentials.split(":");
        if (parts.length != 2) {
            throw new BusinessException(ResponseEnum.OPENAPI_AUTH_INFO_FORMAT_ERROR);
        }

        // Build request DTO
        WorkflowIoTransRequest request = new WorkflowIoTransRequest();
        request.setApiKey(parts[0]);
        request.setApiSecret(parts[1]);

        // Call service layer
        List<JSONObject> result = openApiService.getWorkflowIoTransformations(request);

        return ApiResult.success(result);
    }
}
