package com.iflytek.astron.console.toolkit.service.extra;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import com.iflytek.astron.console.commons.constant.ResponseEnum;
import com.iflytek.astron.console.commons.exception.BusinessException;
import com.iflytek.astron.console.commons.response.ApiResult;
import com.iflytek.astron.console.toolkit.common.constant.CommonConst;
import com.iflytek.astron.console.toolkit.config.properties.ApiUrl;
import com.iflytek.astron.console.toolkit.config.properties.CommonConfig;
import com.iflytek.astron.console.toolkit.entity.core.workflow.FlowProtocol;
import com.iflytek.astron.console.toolkit.util.OkHttpUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CoreSystemService.
 */
@ExtendWith(MockitoExtension.class)
class CoreSystemServiceTest {

    @Mock ApiUrl apiUrl;
    @Mock CommonConfig commonConfig;
    @Mock AppService appService;

    @InjectMocks CoreSystemService service;

    // ================== helpers ==================

    private void setEnv(String env) throws Exception {
        Field f = CoreSystemService.class.getDeclaredField("env");
        f.setAccessible(true);
        f.set(service, env);
    }

    private static MultipartFile mockFile(String name, byte[] bytes) throws Exception {
        MultipartFile f = mock(MultipartFile.class);

        // 这些在某些分支可能不会被调用 → 用 lenient()，避免 UnnecessaryStubbingException
        lenient().when(f.getOriginalFilename()).thenReturn(name);
        lenient().when(f.getInputStream()).thenReturn(new ByteArrayInputStream(bytes));
        lenient().when(f.isEmpty()).thenReturn(bytes == null || bytes.length == 0);

        // 这条在当前 upload 成功路径会被使用 → 保持严格
        when(f.getBytes()).thenReturn(bytes);

        return f;
    }

    private static String ok(Object data) {
        Map<String, Object> m = new HashMap<>();
        m.put("code", 0);
        m.put("message", "ok");
        m.put("data", data);
        return JSON.toJSONString(m);
    }

    private static String fail(String msg) {
        Map<String, Object> m = new HashMap<>();
        m.put("code", 1);
        m.put("message", msg);
        m.put("data", null);
        return JSON.toJSONString(m);
    }

    // ================== publish / auth ==================

    @Test
    @DisplayName("publish(prod) - 非dev环境应签名并校验返回码")
    void publish_prod_success() throws Exception {
        setEnv("prod");
        when(apiUrl.getWorkflow()).thenReturn("http://wf");
        when(apiUrl.getTenantKey()).thenReturn("tk");
        when(apiUrl.getTenantSecret()).thenReturn("ts");
        when(apiUrl.getTenantId()).thenReturn("tid");

        try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
            http.when(() -> OkHttpUtil.post(anyString(), anyMap(), anyString()))
                .thenAnswer(inv -> {
                    String url = inv.getArgument(0);
                    Map<String, String> header = inv.getArgument(1);
                    String body = inv.getArgument(2);
                    assertThat(url).isEqualTo("http://wf" + CoreSystemService.API_PUBLISH_PATH);
                    // header 应包含用户名与签名字段
                    assertThat(header).containsEntry(CoreSystemService.X_CONSUMER_USERNAME, "tid");
                    assertThat(header).containsKeys("authorization", "host", "date", "digest");
                    JSONObject b = JSONObject.parseObject(body);
                    assertThat(b.getString("flow_id")).isEqualTo("F1");
                    assertThat(b.getInteger("plat")).isEqualTo(2);
                    assertThat(b.getInteger("release_status")).isEqualTo(1);
                    assertThat(b.getString("version")).isEqualTo("v1");
                    return ok(null);
                });

            service.publish("F1", 2, 1, "v1");
        }
    }

    @Test
    @DisplayName("publish - 返回码非0应抛BusinessException")
    void publish_fail_throws() throws Exception {
        setEnv("prod");
        when(apiUrl.getWorkflow()).thenReturn("http://wf");
        when(apiUrl.getTenantKey()).thenReturn("tk");
        when(apiUrl.getTenantSecret()).thenReturn("ts");
        when(apiUrl.getTenantId()).thenReturn("tid");

        try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
            http.when(() -> OkHttpUtil.post(anyString(), anyMap(), anyString()))
                .thenReturn(fail("bad"));

            assertThatThrownBy(() -> service.publish("F1", 2, 1, null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("bad");
        }
    }

    @Test
    @DisplayName("auth(dev) - dev环境强制app_id=a01c2bc7且无需签名")
    void auth_dev_forcedAppId() throws Exception {
        setEnv(CommonConst.ENV_DEV); // "dev"
        when(apiUrl.getWorkflow()).thenReturn("http://wf");
        when(apiUrl.getTenantId()).thenReturn("tid");

        try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
            http.when(() -> OkHttpUtil.post(anyString(), anyMap(), anyString()))
                .thenAnswer(inv -> {
                    Map<String, String> header = inv.getArgument(1);
                    String body = inv.getArgument(2);
                    // 只有 X-Consumer-Username，无签名头
                    assertThat(header).containsOnlyKeys(CoreSystemService.X_CONSUMER_USERNAME);
                    assertThat(header).containsEntry(CoreSystemService.X_CONSUMER_USERNAME, "tid");
                    JSONObject b = JSONObject.parseObject(body);
                    assertThat(b.getString("app_id")).isEqualTo("a01c2bc7");
                    assertThat(b.getString("flow_id")).isEqualTo("F2");
                    return ok(null);
                });
            service.auth("F2", "ignored", 1);
        }
    }

    @Test
    @DisplayName("auth(prod) - 返回码非0应抛BusinessException")
    void auth_prod_fail() throws Exception {
        setEnv("prod");
        when(apiUrl.getWorkflow()).thenReturn("http://wf");
        when(apiUrl.getTenantKey()).thenReturn("tk");
        when(apiUrl.getTenantSecret()).thenReturn("ts");
        when(apiUrl.getTenantId()).thenReturn("tid");

        try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
            http.when(() -> OkHttpUtil.post(anyString(), anyMap(), anyString()))
                .thenReturn(fail("auth-err"));

            assertThatThrownBy(() -> service.auth("F3", "APP", 1))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("auth-err");
        }
    }

    // ================== upload file(s) ==================

    @Test
    @DisplayName("uploadFile - 成功：返回data.url并拼接必要Header")
    void uploadFile_success() throws Exception {
        when(apiUrl.getWorkflow()).thenReturn("http://wf");
        when(apiUrl.getTenantId()).thenReturn("tid");

        MultipartFile file = mockFile("a.png", "PNG".getBytes(StandardCharsets.UTF_8));

        try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
            http.when(() -> OkHttpUtil.postMultipart(anyString(), anyMap(), isNull(), anyMap()))
                .thenAnswer(inv -> {
                    String url = inv.getArgument(0);
                    Map<String, String> header = inv.getArgument(1);
                    Map<String, Object> param = inv.getArgument(3);
                    assertThat(url).isEqualTo("http://wf" + CoreSystemService.UPLOAD_FILE_PATH);
                    assertThat(header).containsEntry(CoreSystemService.X_CONSUMER_USERNAME, "tid");
                    assertThat(header).containsEntry("Content-Type", "multipart/form-data");
                    assertThat(param).containsKey("file");
                    return ok(new HashMap<String, Object>() {{
                        put("url", "http://cdn/u.png");
                    }});
                });

            String ret = service.uploadFile(file, "ak", "sk");
            assertThat(ret).isEqualTo("http://cdn/u.png");
        }
    }

    @Test
    @DisplayName("uploadFile - 返回码非0应抛BusinessException")
    void uploadFile_fail_code() throws Exception {
        when(apiUrl.getWorkflow()).thenReturn("http://wf");
        when(apiUrl.getTenantId()).thenReturn("tid");

        MultipartFile file = mockFile("a.png", "x".getBytes());

        try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
            http.when(() -> OkHttpUtil.postMultipart(anyString(), anyMap(), isNull(), anyMap()))
                .thenReturn(fail("upload-err"));

            assertThatThrownBy(() -> service.uploadFile(file, "ak", "sk"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("upload-err");
        }
    }

    @Test
    @DisplayName("uploadFile - HTTP异常应被包装为BusinessException")
    void uploadFile_httpException() throws Exception {
        when(apiUrl.getWorkflow()).thenReturn("http://wf");
        when(apiUrl.getTenantId()).thenReturn("tid");

        MultipartFile file = mockFile("a.png", "x".getBytes());

        try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
            http.when(() -> OkHttpUtil.postMultipart(anyString(), anyMap(), isNull(), anyMap()))
                .thenThrow(new IOException("io down"));

            assertThatThrownBy(() -> service.uploadFile(file, "ak", "sk"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("io down");
        }
    }

    @Test
    @DisplayName("batchUploadFile - 成功：返回data.urls[]")
    void batchUploadFile_success() throws Exception {
        when(apiUrl.getWorkflow()).thenReturn("http://wf");
        when(apiUrl.getTenantId()).thenReturn("tid");

        MultipartFile[] files = new MultipartFile[]{
                mockFile("a.txt", "a".getBytes()), mockFile("b.txt", "b".getBytes())
        };

        try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
            http.when(() -> OkHttpUtil.postMultipart(anyString(), anyMap(), isNull(), anyMap()))
                .thenAnswer(inv -> ok(new HashMap<String, Object>() {{
                    put("urls", Arrays.asList("u1", "u2"));
                }}));

            List<String> urls = service.batchUploadFile(files, "ak", "sk");
            assertThat(urls).containsExactly("u1", "u2");
        }
    }

    @Test
    @DisplayName("batchUploadFile - 返回码非0应抛BusinessException")
    void batchUploadFile_fail_code() throws Exception {
        when(apiUrl.getWorkflow()).thenReturn("http://wf");
        when(apiUrl.getTenantId()).thenReturn("tid");

        try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
            http.when(() -> OkHttpUtil.postMultipart(anyString(), anyMap(), isNull(), anyMap()))
                .thenReturn(fail("bad"));

            assertThatThrownBy(() -> service.batchUploadFile(new MultipartFile[]{}, "ak", "sk"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("bad");
        }
    }

    // ================== header signature ==================

    @Test
    @DisplayName("assembleRequestHeader - 正常：应生成authorization/host/date/digest")
    void assembleRequestHeader_success() {
        Map<String, String> h = service.assembleRequestHeader(
                "http://host:8080/path", "ak", "sk", "POST", "abc".getBytes(StandardCharsets.UTF_8));

        assertThat(h).containsKeys("authorization", "host", "date", "digest");
        assertThat(h.get("authorization"))
                .contains("api_key=\"ak\"")
                .contains("algorithm=\"hmac-sha256\"");
        assertThat(h.get("host")).isEqualTo("host:8080");
        assertThat(h.get("digest")).startsWith("SHA256=");
    }

    @Test
    @DisplayName("assembleRequestHeader - 非法URL应抛BusinessException")
    void assembleRequestHeader_badUrl() {
        assertThatThrownBy(() ->
                service.assembleRequestHeader("::::", "ak", "sk", "POST", "x".getBytes()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("assemble requestHeader  error");
    }

    // ================== compare add/delete ==================

    @Test
    @DisplayName("addComparisons - 成功")
    void addComparisons_success() {
        when(apiUrl.getWorkflow()).thenReturn("http://wf");

        try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
            http.when(() -> OkHttpUtil.post(eq("http://wf" + CoreSystemService.ADD_COMPARISONS_PATH), anyString()))
                .thenReturn(ok(null));

            service.addComparisons(new FlowProtocol(), "F10", "v1");
        }
    }

    @Test
    @DisplayName("addComparisons - 返回码非0应抛BusinessException")
    void addComparisons_fail() {
        when(apiUrl.getWorkflow()).thenReturn("http://wf");

        try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
            http.when(() -> OkHttpUtil.post(anyString(), anyString()))
                .thenReturn(fail("add-err"));

            assertThatThrownBy(() -> service.addComparisons(new FlowProtocol(), "F10", "v1"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("add-err");
        }
    }

    @Test
    @DisplayName("deleteComparisons - 成功")
    void deleteComparisons_success() {
        when(apiUrl.getWorkflow()).thenReturn("http://wf");

        try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
            http.when(() -> OkHttpUtil.delete(eq("http://wf" + CoreSystemService.DELETE_COMPARISONS_PATH), anyString()))
                .thenReturn(ok(null));

            service.deleteComparisons("F10", "v1");
        }
    }

    @Test
    @DisplayName("deleteComparisons - 返回码非0应抛BusinessException")
    void deleteComparisons_fail() {
        when(apiUrl.getWorkflow()).thenReturn("http://wf");

        try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
            http.when(() -> OkHttpUtil.delete(anyString(), anyString()))
                .thenReturn(fail("del-err"));

            assertThatThrownBy(() -> service.deleteComparisons("F10", "v1"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("del-err");
        }
    }

    // ================== SparkDB create/DDL/DML ==================

    @Test
    @DisplayName("createDatabase - 成功返回 database_id")
    void createDatabase_success() {
        when(apiUrl.getSparkDB()).thenReturn("http://db");
        when(apiUrl.getTenantId()).thenReturn("tid");

        try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
            http.when(() -> OkHttpUtil.post(eq("http://db" + CoreSystemService.CREATE_DATABASE_PATH), anyMap(), anyString()))
                    .thenReturn(ok(new HashMap<String, Object>() {{
                        put("database_id", 3_000_000_000L);
                    }}));

            Long id = service.createDatabase("n", "u", 1L, "d");
            assertThat(id).isEqualTo(3_000_000_000L);
        }
    }

    @Test
    @DisplayName("execDDL - 成功（只需不抛异常）")
    void execDDL_success() {
        when(apiUrl.getSparkDB()).thenReturn("http://db");
        when(apiUrl.getTenantId()).thenReturn("tid");

        try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
            http.when(() -> OkHttpUtil.post(eq("http://db" + CoreSystemService.EXEC_DDL_PATH), anyMap(), anyString()))
                .thenReturn(ok(null));

            service.execDDL("create table t(a int)", "u", null, 11L);
        }
    }

    @Nested
    class ExecDmlTests {

        @Test
        @DisplayName("execDML - 其他操作类型：应返回 null")
        void execDml_otherOp_returnsNull() {
            when(apiUrl.getSparkDB()).thenReturn("http://db");
            when(apiUrl.getTenantId()).thenReturn("tid");
            when(commonConfig.getAppId()).thenReturn("APP");

            try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
                http.when(() -> OkHttpUtil.post(anyString(), anyMap(), anyString()))
                        .thenReturn(ok(Collections.singletonMap("exec_success", "[]")));

                //              sql               uid  dbId  spaceId opType envCode(✅改为合法值 1)
                Object ret = service.execDML("update t set a=1", "u", null, 1L, 999, 1);
                assertThat(ret).isNull();
            }
        }

        @Test
        @DisplayName("execDML - 解析异常应包装为BusinessException（含固定前缀）")
        void execDml_parseError_shouldWrap() {
            when(apiUrl.getSparkDB()).thenReturn("http://db");
            when(apiUrl.getTenantId()).thenReturn("tid");
            when(commonConfig.getAppId()).thenReturn("APP");

            // 非法 exec_success 字符串，触发 parse 异常
            Map<String, Object> data = new HashMap<>();
            data.put("exec_success", "not-json");

            try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
                http.when(() -> OkHttpUtil.post(anyString(), anyMap(), anyString()))
                    .thenReturn(ok(data));

                assertThatThrownBy(() -> service.execDML("select *", "u", null, 1L, 1, 1))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("exec dml get search_data error = ,");
            }
        }
    }

    // ================== clone/drop/modify DB ==================

    @Test
    @DisplayName("cloneDataBase - 成功返回 database_id")
    void cloneDatabase_success() {
        when(apiUrl.getSparkDB()).thenReturn("http://db");
        when(apiUrl.getTenantId()).thenReturn("tid");

        try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
            http.when(() -> OkHttpUtil.post(eq("http://db" + CoreSystemService.CLONE_DATABASE_PATH), anyMap(), anyString()))
                    // 关键：用超过 int 范围的 long，Fastjson2 会反序列化为 Long
                    .thenReturn(ok(new HashMap<String, Object>() {{
                        put("database_id", 3_000_000_001L);
                    }}));

            Long id = service.cloneDataBase(9L, "db_new", "u");
            assertThat(id).isEqualTo(3_000_000_001L);
        }
    }

    @Test
    @DisplayName("cloneDataBase - HTTP异常应被包装为BusinessException")
    void cloneDatabase_httpException() {
        when(apiUrl.getSparkDB()).thenReturn("http://db");
        when(apiUrl.getTenantId()).thenReturn("tid");

        try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
            http.when(() -> OkHttpUtil.post(anyString(), anyMap(), anyString()))
                .thenThrow(new RuntimeException("net"));

            assertThatThrownBy(() -> service.cloneDataBase(1L, "x", "u"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("net");
        }
    }

    @Test
    @DisplayName("dropDataBase - 成功（只需不抛异常）")
    void dropDatabase_success() {
        when(apiUrl.getSparkDB()).thenReturn("http://db");
        when(apiUrl.getTenantId()).thenReturn("tid");

        try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
            http.when(() -> OkHttpUtil.post(eq("http://db" + CoreSystemService.DROP_DATABASE_PATH), anyMap(), anyString()))
                .thenReturn(ok(null));

            service.dropDataBase(3L, "u");
        }
    }

    @Test
    @DisplayName("dropDataBase - HTTP异常应被包装为BusinessException")
    void dropDatabase_httpException() {
        when(apiUrl.getSparkDB()).thenReturn("http://db");
        when(apiUrl.getTenantId()).thenReturn("tid");

        try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
            http.when(() -> OkHttpUtil.post(anyString(), anyMap(), anyString()))
                .thenThrow(new RuntimeException("io"));

            assertThatThrownBy(() -> service.dropDataBase(3L, "u"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("io");
        }
    }

    @Test
    @DisplayName("modifyDataBase - 成功（只需不抛异常）")
    void modifyDatabase_success() {
        when(apiUrl.getSparkDB()).thenReturn("http://db");
        when(apiUrl.getTenantId()).thenReturn("tid");

        try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
            http.when(() -> OkHttpUtil.post(eq("http://db" + CoreSystemService.MODIFY_DATABASE_PATH), anyMap(), anyString()))
                .thenReturn(ok(null));

            service.modifyDataBase(3L, "u", "desc");
        }
    }

    @Test
    @DisplayName("modifyDataBase - HTTP异常应被包装为BusinessException")
    void modifyDatabase_httpException() {
        when(apiUrl.getSparkDB()).thenReturn("http://db");
        when(apiUrl.getTenantId()).thenReturn("tid");

        try (MockedStatic<OkHttpUtil> http = mockStatic(OkHttpUtil.class)) {
            http.when(() -> OkHttpUtil.post(anyString(), anyMap(), anyString()))
                .thenThrow(new RuntimeException("io"));

            assertThatThrownBy(() -> service.modifyDataBase(3L, "u", "d"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("io");
        }
    }
}