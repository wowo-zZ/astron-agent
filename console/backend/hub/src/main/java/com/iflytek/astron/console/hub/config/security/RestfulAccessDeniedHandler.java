package com.iflytek.astron.console.hub.config.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iflytek.astron.console.commons.constant.ResponseEnum;
import com.iflytek.astron.console.commons.response.ApiResult;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import com.alibaba.fastjson2.JSON;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Custom AccessDeniedHandler for returning JSON formatted 403 responses
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class RestfulAccessDeniedHandler implements AccessDeniedHandler {
    private final ObjectMapper objectMapper;

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException {
        // Set HTTP status code to: 403 FORBIDDEN
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("application/json;charset=UTF-8");

        ApiResult<String> apiResult = ApiResult.error(ResponseEnum.FORBIDDEN);
        log.debug("RequestURL: {}, params: {}, AccessDeniedException: {}", request.getRequestURL(), JSON.toJSONString(request.getParameterMap()), accessDeniedException.getMessage(), accessDeniedException);
        response.getWriter().write(objectMapper.writeValueAsString(apiResult));
    }
}
