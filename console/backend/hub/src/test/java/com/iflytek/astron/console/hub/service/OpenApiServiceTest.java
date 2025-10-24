package com.iflytek.astron.console.hub.service;

import com.alibaba.fastjson2.JSONObject;
import com.iflytek.astron.console.commons.response.ApiResult;
import com.iflytek.astron.console.toolkit.controller.open.OpenApiController;
import com.iflytek.astron.console.toolkit.service.openapi.OpenApiService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

/**
 * @Description:
 */
@Slf4j
@SpringBootTest
public class OpenApiServiceTest {
    @Autowired
    private OpenApiService openApiService;
    @Autowired
    private OpenApiController openApiController;

    @Test
    void getOpenApi() {
        ApiResult<List<JSONObject>> result = openApiController.getWorkflowIoInfoList("Bearer 17e9c079c3a70c42e45526c2b9ba176f:ZGM3ZWFlZmI4YWU0Y2NlOGViMGY0ZDJi");
        List<JSONObject> workflowIoTransformations = result.data();
        for (JSONObject workflowIoTransformation : workflowIoTransformations) {
            log.info("workflowIoTransformation:{}", workflowIoTransformation.toString());
        }
    }
}
