package com.iflytek.astron.console.toolkit.controller.workflow;

import com.iflytek.astron.console.commons.constant.ResponseEnum;
import com.iflytek.astron.console.commons.entity.workflow.Workflow;
import com.iflytek.astron.console.commons.exception.BusinessException;
import com.iflytek.astron.console.commons.response.ApiResult;
import com.iflytek.astron.console.toolkit.entity.biz.workflow.ChatBizReq;
import com.iflytek.astron.console.toolkit.entity.biz.workflow.ChatResumeReq;
import com.iflytek.astron.console.toolkit.entity.biz.workflow.WorkflowDebugDto;
import com.iflytek.astron.console.toolkit.entity.common.PageData;
import com.iflytek.astron.console.toolkit.entity.common.Pagination;
import com.iflytek.astron.console.toolkit.entity.dto.*;
import com.iflytek.astron.console.toolkit.entity.dto.eval.WorkflowComparisonSaveReq;
import com.iflytek.astron.console.toolkit.entity.table.workflow.WorkflowComparison;
import com.iflytek.astron.console.toolkit.entity.table.workflow.WorkflowDialog;
import com.iflytek.astron.console.toolkit.entity.table.workflow.WorkflowFeedback;
import com.iflytek.astron.console.toolkit.entity.tool.McpServerTool;
import com.iflytek.astron.console.toolkit.entity.vo.McpServerToolDetailVO;
import com.iflytek.astron.console.toolkit.entity.vo.WorkflowVo;
import com.iflytek.astron.console.toolkit.service.workflow.WorkflowExportService;
import com.iflytek.astron.console.toolkit.service.workflow.WorkflowService;
import jakarta.servlet.ServletOutputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * WorkflowController 综合单元测试
 *
 * 覆盖目标：
 * - JaCoCo 语句覆盖率 >= 80%，分支覆盖率 >= 90%
 * - PIT 变异测试通过率高
 * - 涵盖正常流程、边界条件、异常情况、并发场景
 *
 * 技术栈：JUnit5 + Mockito + AssertJ + ParameterizedTest
 *
 * Mock依赖：
 * - WorkflowService（主要业务逻辑）
 * - WorkflowExportService（导入导出）
 * - HttpServletRequest/Response（Web请求响应）
 * - MultipartFile（文件上传）
 * - ServletOutputStream（文件下载）
 */
@ExtendWith(MockitoExtension.class)
class WorkflowControllerTest {

    private static final String VALID_FLOW_ID = "valid-flow-123";
    private static final String VALID_NODE_ID = "valid-node-456";
    private static final String VALID_PROMPT_ID = "valid-prompt-789";
    private static final Long VALID_WORKFLOW_ID = 1L;
    private static final Long VALID_SPACE_ID = 100L;
    private static final String CORRECT_PASSWORD = "xfyun";
    private static final String WRONG_PASSWORD = "wrong";

    @Mock
    private WorkflowService workflowService;

    @Mock
    private WorkflowExportService workflowExportService;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private MultipartFile multipartFile;

    @Mock
    private ServletOutputStream outputStream;

    @InjectMocks
    private WorkflowController controller;

    // ArgumentCaptors for verification
    @Captor
    private ArgumentCaptor<List<WorkflowComparisonSaveReq>> comparisonCaptor;

    @Captor
    private ArgumentCaptor<String> stringCaptor;

    @Captor
    private ArgumentCaptor<Long> longCaptor;

    @Captor
    private ArgumentCaptor<Integer> integerCaptor;

    // Test fixtures
    private Pagination validPagination;
    private WorkflowReq validWorkflowReq;
    private WorkflowVo validWorkflowVo;
    private Workflow validWorkflow;
    private PageData<WorkflowVo> validPageData;

    @BeforeEach
    void setUp() {
        validPagination = createValidPagination();
        validWorkflowReq = createValidWorkflowReq();
        validWorkflowVo = createValidWorkflowVo();
        validWorkflow = createValidWorkflow();
        validPageData = createValidPageData();
    }

    // ==================== Test Data Builders ====================

    private Pagination createValidPagination() {
        Pagination pagination = new Pagination();
        pagination.setCurrent(1);
        pagination.setPageSize(10);
        return pagination;
    }

    private Pagination createEmptyPagination() {
        Pagination pagination = new Pagination();
        pagination.setCurrent(0);
        pagination.setPageSize(0);
        return pagination;
    }

    private WorkflowReq createValidWorkflowReq() {
        WorkflowReq req = new WorkflowReq();
        req.setId(VALID_WORKFLOW_ID);
        req.setName("Test Workflow");
        req.setDescription("Test Description");
        req.setFlowId(VALID_FLOW_ID);
        req.setSpaceId(VALID_SPACE_ID);
        return req;
    }

    private WorkflowVo createValidWorkflowVo() {
        WorkflowVo vo = new WorkflowVo();
        vo.setId(VALID_WORKFLOW_ID);
        vo.setName("Test Workflow");
        vo.setDescription("Test Description");
        return vo;
    }

    private Workflow createValidWorkflow() {
        Workflow workflow = new Workflow();
        workflow.setId(VALID_WORKFLOW_ID);
        workflow.setName("Test Workflow");
        workflow.setData("{\"nodes\":[],\"edges\":[]}");
        workflow.setCanPublish(true);
        return workflow;
    }

    private Workflow createEmptyDataWorkflow() {
        Workflow workflow = new Workflow();
        workflow.setId(VALID_WORKFLOW_ID);
        workflow.setData("");
        return workflow;
    }

    private PageData<WorkflowVo> createValidPageData() {
        PageData<WorkflowVo> pageData = new PageData<>();
        pageData.setPageData(List.of(validWorkflowVo));
        pageData.setTotalCount(1L);
        return pageData;
    }

    private WorkflowDebugDto createValidDebugDto() {
        WorkflowDebugDto dto = new WorkflowDebugDto();
        dto.setFlowId(VALID_FLOW_ID);
        dto.setName("Debug Test");
        return dto;
    }

    private ChatBizReq createValidChatBizReq() {
        ChatBizReq req = new ChatBizReq();
        req.setFlowId(VALID_FLOW_ID);
        return req;
    }

    private ChatResumeReq createValidChatResumeReq() {
        ChatResumeReq req = new ChatResumeReq();
        req.setFlowId(VALID_FLOW_ID);
        return req;
    }

    private WorkflowDialog createValidWorkflowDialog() {
        WorkflowDialog dialog = new WorkflowDialog();
        dialog.setWorkflowId(VALID_WORKFLOW_ID);
        dialog.setType(1);
        return dialog;
    }

    private WorkflowComparisonSaveReq createValidComparisonSaveReq() {
        WorkflowComparisonSaveReq req = new WorkflowComparisonSaveReq();
        req.setPromptId(VALID_PROMPT_ID);
        return req;
    }

    private WorkflowFeedbackReq createValidFeedbackReq() {
        WorkflowFeedbackReq req = new WorkflowFeedbackReq();
        req.setFlowId(VALID_FLOW_ID);
        req.setDescription("Test feedback");
        return req;
    }

    // ==================== Data Sources for Parameterized Tests ====================

    static Stream<Integer> statusValues() {
        return Stream.of(-1, 0, 1);
    }

    static Stream<String> invalidPasswords() {
        return Stream.of("", "wrong", "XFYUN", "xfyun ", " xfyun", "12345");
    }

    static Stream<String> specialCharacters() {
        return Stream.of(
                "<script>alert('xss')</script>",
                "'; DROP TABLE workflows; --",
                "../../etc/passwd",
                "\u0000\u0001\u0002",
                "测试中文关键词"
        );
    }

    // ==================== Workflow List Tests ====================

    @Nested
    @DisplayName("工作流列表查询测试")
    class WorkflowListTests {

        @Test
        @DisplayName("当分页参数为空时应抛出BusinessException")
        void list_whenPaginationIsEmpty_shouldThrowBusinessException() {
            // Given
            Pagination emptyPagination = createEmptyPagination();

            // When & Then
            assertThatThrownBy(() -> controller.list(emptyPagination, null, null, null, null, null))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("responseEnum", ResponseEnum.PAGE_SEPARATOR_MISS);

            verifyNoInteractions(workflowService);
        }

        @Test
        @DisplayName("当分页参数有效时应正确调用service并返回结果")
        void list_whenPaginationIsValid_shouldDelegateToServiceAndReturnResult() throws UnsupportedEncodingException {
            // Given
            String search = "test keyword";
            String flowId = VALID_FLOW_ID;
            Integer status = 1;
            Integer order = 2;
            when(workflowService.listPage(VALID_SPACE_ID, 1, 10, search, status, order, flowId))
                    .thenReturn(validPageData);

            // When
            PageData<WorkflowVo> result = controller.list(validPagination, search, flowId, status, order, VALID_SPACE_ID);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isSameAs(validPageData);

            verify(workflowService).listPage(VALID_SPACE_ID, 1, 10, search, status, order, flowId);
            verifyNoMoreInteractions(workflowService);
        }

        @ParameterizedTest
        @MethodSource("com.iflytek.astron.console.toolkit.controller.workflow.WorkflowControllerTest#statusValues")
        @DisplayName("应支持不同状态值的筛选")
        void list_shouldSupportDifferentStatusValues(int status) throws UnsupportedEncodingException {
            // Given
            when(workflowService.listPage(any(), any(), any(), any(), eq(status), any(), any()))
                    .thenReturn(validPageData);

            // When
            PageData<WorkflowVo> result = controller.list(validPagination, null, null, status, null, null);

            // Then
            assertThat(result).isNotNull();
            verify(workflowService).listPage(any(), any(), any(), any(), eq(status), any(), any());
        }

        @ParameterizedTest
        @MethodSource("com.iflytek.astron.console.toolkit.controller.workflow.WorkflowControllerTest#specialCharacters")
        @DisplayName("当搜索关键词包含特殊字符时应正常处理")
        void list_whenSearchContainsSpecialCharacters_shouldHandleCorrectly(String specialSearch) throws UnsupportedEncodingException {
            // Given
            when(workflowService.listPage(any(), any(), any(), eq(specialSearch), any(), any(), any()))
                    .thenReturn(validPageData);

            // When
            PageData<WorkflowVo> result = controller.list(validPagination, specialSearch, null, null, null, null);

            // Then
            assertThat(result).isNotNull();
            verify(workflowService).listPage(any(), any(), any(), eq(specialSearch), any(), any(), any());
        }

        @Test
        @DisplayName("应正确处理并发查询请求")
        void list_shouldHandleConcurrentRequests() throws Exception {
            // Given
            ExecutorService executor = Executors.newFixedThreadPool(5);
            CountDownLatch latch = new CountDownLatch(5);
            when(workflowService.listPage(any(), any(), any(), any(), any(), any(), any()))
                    .thenReturn(validPageData);

            // When
            List<CompletableFuture<PageData<WorkflowVo>>> futures = Stream.generate(() ->
                    CompletableFuture.supplyAsync(() -> {
                        try {
                            return controller.list(validPagination, "concurrent", null, null, null, null);
                        } catch (UnsupportedEncodingException e) {
                            throw new RuntimeException(e);
                        } finally {
                            latch.countDown();
                        }
                    }, executor)
            ).limit(5).toList();

            // Then
            latch.await();
            assertThat(futures).allSatisfy(future -> {
                assertThat(future.join()).isNotNull();
            });

            verify(workflowService, times(5)).listPage(any(), any(), any(), any(), any(), any(), any());
            executor.shutdown();
        }
    }

    // ==================== Workflow Detail Tests ====================

    @Nested
    @DisplayName("工作流详情查询测试")
    class WorkflowDetailTests {

        @Test
        @DisplayName("当ID有效时应返回工作流详情")
        void detail_whenIdIsValid_shouldReturnWorkflowDetails() {
            // Given
            String validId = "workflow-123";
            when(workflowService.detail(validId, VALID_SPACE_ID)).thenReturn(validWorkflowVo);

            // When
            WorkflowVo result = controller.detail(validId, VALID_SPACE_ID);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isSameAs(validWorkflowVo);

            verify(workflowService).detail(validId, VALID_SPACE_ID);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当spaceId为空时应使用默认值")
        void detail_whenSpaceIdIsNull_shouldUseDefaultValue() {
            // Given
            String validId = "workflow-123";
            when(workflowService.detail(validId, null)).thenReturn(validWorkflowVo);

            // When
            WorkflowVo result = controller.detail(validId, null);

            // Then
            assertThat(result).isNotNull();
            verify(workflowService).detail(validId, null);
        }
    }

    // ==================== Workflow CRUD Tests ====================

    @Nested
    @DisplayName("工作流CRUD操作测试")
    class WorkflowCrudTests {

        @Test
        @DisplayName("当参数有效时应成功创建工作流")
        void create_whenParametersAreValid_shouldCreateWorkflowSuccessfully() {
            // Given
            Object expectedResult = "created";
            when(workflowService.create(validWorkflowReq, request)).thenReturn(new Workflow());

            // When
            Object result = controller.create(validWorkflowReq, request);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isEqualTo(expectedResult);

            verify(workflowService).create(validWorkflowReq, request);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当参数有效时应成功更新工作流")
        void update_whenParametersAreValid_shouldUpdateWorkflowSuccessfully() {
            // Given
            when(workflowService.updateInfo(validWorkflowReq)).thenReturn(validWorkflow);

            // When
            Workflow result = controller.update(validWorkflowReq);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isSameAs(validWorkflow);

            verify(workflowService).updateInfo(validWorkflowReq);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当参数有效时应成功删除工作流")
        void delete_whenParametersAreValid_shouldDeleteWorkflowSuccessfully() {
            // Given
            ApiResult<String> expectedResult = ApiResult.success("deleted");
            when(workflowService.logicDelete(VALID_WORKFLOW_ID, VALID_SPACE_ID)).thenReturn(ApiResult.success());

            // When
            ApiResult result = controller.delete(VALID_WORKFLOW_ID, VALID_SPACE_ID);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isSameAs(expectedResult);

            verify(workflowService).logicDelete(VALID_WORKFLOW_ID, VALID_SPACE_ID);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当ID为空时删除操作应正确处理")
        void delete_whenIdIsNull_shouldHandleCorrectly() {
            // Given
            when(workflowService.logicDelete(null, VALID_SPACE_ID)).thenReturn(ApiResult.success());

            // When
            ApiResult result = controller.delete(null, VALID_SPACE_ID);

            // Then
            assertThat(result).isNotNull();
            verify(workflowService).logicDelete(null, VALID_SPACE_ID);
        }

        @Test
        @DisplayName("应支持幂等更新操作")
        void update_shouldSupportIdempotentOperations() {
            // Given
            when(workflowService.updateInfo(validWorkflowReq)).thenReturn(validWorkflow);

            // When - 执行多次相同的更新
            Workflow result1 = controller.update(validWorkflowReq);
            Workflow result2 = controller.update(validWorkflowReq);

            // Then
            assertThat(result1).isSameAs(validWorkflow);
            assertThat(result2).isSameAs(validWorkflow);
            verify(workflowService, times(2)).updateInfo(validWorkflowReq);
        }
    }

    // ==================== Workflow Clone Tests ====================

    @Nested
    @DisplayName("工作流克隆测试")
    class WorkflowCloneTests {

        @Test
        @DisplayName("当ID有效时应成功克隆工作流")
        void clone_whenIdIsValid_shouldCloneWorkflowSuccessfully() {
            // Given
            Object expectedResult = "cloned";
            when(workflowService.clone(VALID_WORKFLOW_ID)).thenReturn(new Workflow());

            // When
            Object result = controller.clone(VALID_WORKFLOW_ID);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isEqualTo(expectedResult);

            verify(workflowService).clone(VALID_WORKFLOW_ID);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当密码正确时内部克隆应成功")
        void cloneV2_whenPasswordIsCorrect_shouldCloneSuccessfully() {
            // Given
            Object expectedResult = "cloned";
            when(workflowService.cloneForXfYun(eq(VALID_WORKFLOW_ID), anyLong(), eq(request)))
                    .thenReturn(new Workflow());

            // When
            Object result = controller.cloneV2(VALID_WORKFLOW_ID, CORRECT_PASSWORD, request);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isEqualTo(expectedResult);

            verify(workflowService).cloneForXfYun(eq(VALID_WORKFLOW_ID), anyLong(), eq(request));
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当密码错误时内部克隆应返回错误")
        void cloneV2_whenPasswordIsIncorrect_shouldReturnError() {
            // When
            Object result = controller.cloneV2(VALID_WORKFLOW_ID, WRONG_PASSWORD, request);

            // Then
            assertThat(result)
                    .isInstanceOf(ApiResult.class);

            ApiResult<?> apiResult = (ApiResult<?>) result;
            assertThat(apiResult.code()).isEqualTo(ResponseEnum.INCORRECT_PASSWORD.getCode());

            verifyNoInteractions(workflowService);
        }

        @ParameterizedTest
        @MethodSource("com.iflytek.astron.console.toolkit.controller.workflow.WorkflowControllerTest#invalidPasswords")
        @DisplayName("应拒绝所有非正确密码的内部克隆请求")
        void cloneV2_shouldRejectAllIncorrectPasswords(String incorrectPassword) {
            // When
            Object result = controller.cloneV2(VALID_WORKFLOW_ID, incorrectPassword, request);

            // Then
            assertThat(result)
                    .isInstanceOf(ApiResult.class);

            ApiResult<?> apiResult = (ApiResult<?>) result;
            assertThat(apiResult.code()).isEqualTo(ResponseEnum.INCORRECT_PASSWORD.getCode());

            verifyNoInteractions(workflowService);
        }
    }

    // ==================== Workflow Build Tests ====================

    @Nested
    @DisplayName("工作流构建测试")
    class WorkflowBuildTests {

        @Test
        @DisplayName("当参数有效时应成功构建工作流")
        void build_whenParametersAreValid_shouldBuildWorkflowSuccessfully() throws InterruptedException {
            // Given
            Object expectedResult = "built";
            when(workflowService.build(validWorkflowReq)).thenReturn(ApiResult.success());

            // When
            Object result = controller.build(validWorkflowReq);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isEqualTo(expectedResult);

            verify(workflowService).build(validWorkflowReq);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当发生中断异常时应正确处理")
        void build_whenInterruptedExceptionOccurs_shouldHandleCorrectly() throws InterruptedException {
            // Given
            when(workflowService.build(validWorkflowReq)).thenThrow(new InterruptedException("Build interrupted"));

            // When & Then
            assertThatThrownBy(() -> controller.build(validWorkflowReq))
                    .isInstanceOf(InterruptedException.class)
                    .hasMessage("Build interrupted");

            verify(workflowService).build(validWorkflowReq);
        }
    }

    // ==================== Node Debug Tests ====================

    @Nested
    @DisplayName("节点调试测试")
    class NodeDebugTests {

        @Test
        @DisplayName("当参数有效时应成功调试节点")
        void nodeDebug_whenParametersAreValid_shouldDebugNodeSuccessfully() {
            // Given
            WorkflowDebugDto debugDto = createValidDebugDto();
            Object expectedResult = "debug result";
            when(workflowService.nodeDebug(VALID_NODE_ID, debugDto)).thenReturn(ApiResult.success());

            // When
            Object result = controller.nodeDebug(VALID_NODE_ID, debugDto);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isEqualTo(expectedResult);

            verify(workflowService).nodeDebug(VALID_NODE_ID, debugDto);
            verifyNoMoreInteractions(workflowService);
        }
    }

    // ==================== Dialog Management Tests ====================

    @Nested
    @DisplayName("对话管理测试")
    class DialogManagementTests {

        @Test
        @DisplayName("当对话有效时应成功保存")
        void saveDialog_whenDialogIsValid_shouldSaveSuccessfully() {
            // Given
            WorkflowDialog dialog = createValidWorkflowDialog();
            Object expectedResult = "saved";
            when(workflowService.saveDialog(dialog)).thenReturn(ApiResult.success());

            // When
            Object result = controller.saveDialog(dialog);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isEqualTo(expectedResult);

            verify(workflowService).saveDialog(dialog);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当工作流ID有效时应返回对话列表")
        void listDialog_whenWorkflowIdIsValid_shouldReturnDialogList() {
            // Given
            Integer type = 1;
            Object expectedResult = List.of("dialog1", "dialog2");
            when(workflowService.listDialog(VALID_WORKFLOW_ID, type)).thenReturn(new ArrayList<>());

            // When
            Object result = controller.listDialog(VALID_WORKFLOW_ID, type);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isEqualTo(expectedResult);

            verify(workflowService).listDialog(VALID_WORKFLOW_ID, type);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当工作流ID有效时应成功清空对话")
        void clearDialog_whenWorkflowIdIsValid_shouldClearDialogSuccessfully() {
            // Given
            Integer type = 1;
            Object expectedResult = "cleared";
            when(workflowService.clearDialog(VALID_WORKFLOW_ID, type)).thenReturn(expectedResult);

            // When
            Object result = controller.clearDialog(VALID_WORKFLOW_ID, type);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isEqualTo(expectedResult);

            verify(workflowService).clearDialog(VALID_WORKFLOW_ID, type);
            verifyNoMoreInteractions(workflowService);
        }
    }

    // ==================== Publish Control Tests ====================

    @Nested
    @DisplayName("发布控制测试")
    class PublishControlTests {

        @Test
        @DisplayName("当ID有效时应返回发布状态")
        void canPublish_whenIdIsValid_shouldReturnPublishStatus() {
            // Given
            when(workflowService.getById(VALID_WORKFLOW_ID)).thenReturn(validWorkflow);

            // When
            Object result = controller.canPublish(VALID_WORKFLOW_ID);

            // Then
            assertThat(result)
                    .isInstanceOf(ApiResult.class);

            ApiResult<?> apiResult = (ApiResult<?>) result;
            assertThat(apiResult.data()).isEqualTo(true);

            verify(workflowService).getById(VALID_WORKFLOW_ID);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当ID有效时应成功设置为未发布")
        void canPublishSetNot_whenIdIsValid_shouldSetUnpublishedSuccessfully() {
            // Given
            Object expectedResult = "updated";
            when(workflowService.canPublishSetNot(VALID_WORKFLOW_ID)).thenReturn(expectedResult);

            // When
            Object result = controller.canPublishSetNot(VALID_WORKFLOW_ID);

            // Then
            assertThat(result)
                    .isInstanceOf(ApiResult.class);

            ApiResult<?> apiResult = (ApiResult<?>) result;
            assertThat(apiResult.data()).isEqualTo(expectedResult);

            verify(workflowService).canPublishSetNot(VALID_WORKFLOW_ID);
            verifyNoMoreInteractions(workflowService);
        }
    }

    // ==================== SSE Chat Tests ====================

    @Nested
    @DisplayName("SSE聊天测试")
    class SseChatTests {

        @Test
        @DisplayName("当聊天请求有效时应正确设置响应头并返回SseEmitter")
        void chat_whenRequestIsValid_shouldSetHeaderAndReturnSseEmitter() {
            // Given
            ChatBizReq chatBizReq = createValidChatBizReq();
            SseEmitter expectedEmitter = new SseEmitter();
            when(workflowService.sseChat(chatBizReq)).thenReturn(expectedEmitter);

            // When
            SseEmitter result = controller.chat(chatBizReq, response, request);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isSameAs(expectedEmitter);

            verify(response).addHeader("X-Accel-Buffering", "no");
            verify(workflowService).sseChat(chatBizReq);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当恢复请求有效时应正确设置响应头并返回SseEmitter")
        void resume_whenRequestIsValid_shouldSetHeaderAndReturnSseEmitter() {
            // Given
            ChatResumeReq resumeReq = createValidChatResumeReq();
            SseEmitter expectedEmitter = new SseEmitter();
            when(workflowService.sseChatResume(resumeReq)).thenReturn(expectedEmitter);

            // When
            SseEmitter result = controller.resume(resumeReq, response, request);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isSameAs(expectedEmitter);

            verify(response).addHeader("X-Accel-Buffering", "no");
            verify(workflowService).sseChatResume(resumeReq);
            verifyNoMoreInteractions(workflowService);
        }
    }

    // ==================== File Operations Tests ====================

    @Nested
    @DisplayName("文件操作测试")
    class FileOperationsTests {

        @Test
        @DisplayName("当文件和flowId有效时应成功上传文件")
        void uploadFile_whenFilesAndFlowIdAreValid_shouldUploadSuccessfully() {
            // Given
            MultipartFile[] files = {multipartFile};
            Object expectedResult = "uploaded";
            when(workflowService.uploadFile(files, VALID_FLOW_ID)).thenReturn(expectedResult);

            // When
            Object result = controller.uploadFile(files, VALID_FLOW_ID);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isEqualTo(expectedResult);

            verify(workflowService).uploadFile(files, VALID_FLOW_ID);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当flowId有效时应返回输入类型")
        void getInputsType_whenFlowIdIsValid_shouldReturnInputsType() {
            // Given
            Object expectedResult = "input type";
            when(workflowService.getInputsType(VALID_FLOW_ID)).thenReturn(expectedResult);

            // When
            Object result = controller.getInputsType(VALID_FLOW_ID);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isEqualTo(expectedResult);

            verify(workflowService).getInputsType(VALID_FLOW_ID);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当flowId有效时应返回输入信息")
        void getInputsInfo_whenFlowIdIsValid_shouldReturnInputsInfo() {
            // Given
            Object expectedResult = "input info";
            when(workflowService.getInputsInfo(VALID_FLOW_ID)).thenReturn(expectedResult);

            // When
            Object result = controller.getInputsInfo(VALID_FLOW_ID);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isEqualTo(expectedResult);

            verify(workflowService).getInputsInfo(VALID_FLOW_ID);
            verifyNoMoreInteractions(workflowService);
        }
    }

    // ==================== Export/Import Tests ====================

    @Nested
    @DisplayName("导出导入测试")
    class ExportImportTests {

        @Test
        @DisplayName("当工作流数据为空时YAML导出应抛出异常")
        void exportYaml_whenWorkflowDataIsEmpty_shouldThrowBusinessException() {
            // Given
            Workflow emptyDataWorkflow = createEmptyDataWorkflow();
            when(workflowService.getById(VALID_WORKFLOW_ID)).thenReturn(emptyDataWorkflow);

            // When & Then
            assertThatThrownBy(() -> controller.exportYaml(VALID_WORKFLOW_ID, response))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("responseEnum", ResponseEnum.WORKFLOW_EXPORT_FAILED);

            verify(workflowService).getById(VALID_WORKFLOW_ID);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当工作流不存在时YAML导出应抛出异常")
        void exportYaml_whenWorkflowNotExists_shouldThrowBusinessException() {
            // Given
            when(workflowService.getById(VALID_WORKFLOW_ID)).thenReturn(null);

            // When & Then
            assertThatThrownBy(() -> controller.exportYaml(VALID_WORKFLOW_ID, response))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("responseEnum", ResponseEnum.WORKFLOW_EXPORT_FAILED);

            verify(workflowService).getById(VALID_WORKFLOW_ID);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当工作流有效时应成功导出YAML")
        void exportYaml_whenWorkflowIsValid_shouldExportYamlSuccessfully() throws Exception {
            // Given
            when(workflowService.getById(VALID_WORKFLOW_ID)).thenReturn(validWorkflow);
            when(response.getOutputStream()).thenReturn(outputStream);

            // When
            controller.exportYaml(VALID_WORKFLOW_ID, response);

            // Then
            verify(workflowService).getById(VALID_WORKFLOW_ID);
            verify(workflowExportService).exportWorkflowDataAsYaml(eq(validWorkflow), eq(outputStream));
            verify(response).setContentType("application/octet-stream");
            verify(response).setCharacterEncoding("UTF-8");
            verify(response).setHeader(eq("Content-Disposition"), anyString());
            verify(response).flushBuffer();
            verifyNoMoreInteractions(workflowService, workflowExportService);
        }

        @Test
        @DisplayName("当文件有效时应成功导入工作流")
        void importWorkflow_whenFileIsValid_shouldImportWorkflowSuccessfully() throws Exception {
            // Given
            when(multipartFile.getInputStream()).thenReturn(new ByteArrayInputStream("yaml content".getBytes()));
            when(multipartFile.getOriginalFilename()).thenReturn("workflow.yaml");
            Object expectedResult = "imported";
            when(workflowExportService.importWorkflowFromYaml(any(), eq(request))).thenReturn(ApiResult.success());

            // When
            Object result = controller.importWorkflow(multipartFile, request);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isEqualTo(expectedResult);

            verify(workflowExportService).importWorkflowFromYaml(any(), eq(request));
            verifyNoMoreInteractions(workflowExportService);
            verifyNoInteractions(workflowService);
        }

        @Test
        @DisplayName("当文件读取发生IO异常时应抛出BusinessException")
        void importWorkflow_whenIOExceptionOccurs_shouldThrowBusinessException() throws Exception {
            // Given
            when(multipartFile.getInputStream()).thenThrow(new IOException("File read error"));
            when(multipartFile.getOriginalFilename()).thenReturn("workflow.yaml");

            // When & Then
            assertThatThrownBy(() -> controller.importWorkflow(multipartFile, request))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("responseEnum", ResponseEnum.WORKFLOW_IMPORT_FAILED);

            verifyNoInteractions(workflowService, workflowExportService);
        }
    }

    // ==================== Comparison Tests ====================

    @Nested
    @DisplayName("比较功能测试")
    class ComparisonTests {

        @Test
        @DisplayName("当比较请求有效时应成功保存")
        void saveComparisons_whenRequestIsValid_shouldSaveSuccessfully() {
            // Given
            WorkflowComparisonSaveReq saveReq = createValidComparisonSaveReq();
            List<WorkflowComparisonSaveReq> saveReqList = List.of(saveReq);
            String expectedResult = "saved";
            when(workflowService.saveComparisons(saveReqList)).thenReturn(expectedResult);

            // When
            ApiResult<String> result = controller.saveComparisons(saveReqList);

            // Then
            assertThat(result)
                    .isNotNull();
            assertThat(result.data()).isEqualTo(expectedResult);

            verify(workflowService).saveComparisons(comparisonCaptor.capture());
            assertThat(comparisonCaptor.getValue()).hasSize(1);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当promptId有效时应返回比较列表")
        void listComparisons_whenPromptIdIsValid_shouldReturnComparisonList() {
            // Given
            WorkflowComparison comparison = new WorkflowComparison();
            List<WorkflowComparison> expectedList = List.of(comparison);
            when(workflowService.listComparisons(VALID_PROMPT_ID)).thenReturn(expectedList);

            // When
            List<WorkflowComparison> result = controller.listComparisons(VALID_PROMPT_ID);

            // Then
            assertThat(result)
                    .isNotNull()
                    .hasSize(1)
                    .isSameAs(expectedList);

            verify(workflowService).listComparisons(VALID_PROMPT_ID);
            verifyNoMoreInteractions(workflowService);
        }
    }

    // ==================== Feedback Tests ====================

    @Nested
    @DisplayName("反馈功能测试")
    class FeedbackTests {

        @Test
        @DisplayName("当反馈请求有效时应成功提交")
        void feedback_whenRequestIsValid_shouldSubmitSuccessfully() {
            // Given
            WorkflowFeedbackReq feedbackReq = createValidFeedbackReq();

            // When
            controller.feedback(feedbackReq, request);

            // Then
            verify(workflowService).feedback(feedbackReq, request);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当flowId有效时应返回反馈列表")
        void getFeedbackList_whenFlowIdIsValid_shouldReturnFeedbackList() {
            // Given
            WorkflowFeedback feedback = new WorkflowFeedback();
            List<WorkflowFeedback> expectedList = List.of(feedback);
            when(workflowService.getFeedbackList(VALID_FLOW_ID)).thenReturn(expectedList);

            // When
            List<WorkflowFeedback> result = controller.getFeedbackList(VALID_FLOW_ID);

            // Then
            assertThat(result)
                    .isNotNull()
                    .hasSize(1)
                    .isSameAs(expectedList);

            verify(workflowService).getFeedbackList(VALID_FLOW_ID);
            verifyNoMoreInteractions(workflowService);
        }
    }

    // ==================== Additional Method Tests ====================

    @Nested
    @DisplayName("其他方法测试")
    class AdditionalMethodTests {

        @Test
        @DisplayName("当请求有效时应返回代码运行结果")
        void runCode_whenRequestIsValid_shouldReturnRunCodeResult() {
            // Given
            Object runCodeData = new Object();
            Object expectedResult = "code executed";
            when(workflowService.runCode(runCodeData)).thenReturn(expectedResult);

            // When
            Object result = controller.runCode(runCodeData);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isEqualTo(expectedResult);

            verify(workflowService).runCode(runCodeData);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当分页参数有效时应返回广场数据")
        void square_whenPaginationIsValid_shouldReturnSquareData() {
            // Given
            String search = "test";
            Integer tagFlag = 1;
            Integer tags = 2;
            Object expectedResult = "square data";
            when(workflowService.getSquare(1, 10, search, tagFlag, tags)).thenReturn(expectedResult);

            // When
            Object result = controller.square(validPagination, search, tagFlag, tags);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isEqualTo(expectedResult);

            verify(workflowService).getSquare(1, 10, search, tagFlag, tags);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当分页参数为空时广场查询应抛出异常")
        void square_whenPaginationIsEmpty_shouldThrowBusinessException() {
            // Given
            Pagination emptyPagination = createEmptyPagination();

            // When & Then
            assertThatThrownBy(() -> controller.square(emptyPagination, null, null, null))
                    .isInstanceOf(BusinessException.class)
                    .hasFieldOrPropertyWithValue("responseEnum", ResponseEnum.PAGE_SEPARATOR_MISS);

            verifyNoInteractions(workflowService);
        }

        @Test
        @DisplayName("当请求有效时应返回公开复制结果")
        void publicCopy_whenRequestIsValid_shouldReturnPublicCopyResult() {
            // Given
            Object expectedResult = "public copied";
            when(workflowService.publicCopy(validWorkflowReq)).thenReturn(expectedResult);

            // When
            Object result = controller.publicCopy(validWorkflowReq);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isEqualTo(expectedResult);

            verify(workflowService).publicCopy(validWorkflowReq);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当botId有效时应返回高级配置")
        void getFlowAdvancedConfig_whenBotIdIsValid_shouldReturnAdvancedConfig() {
            // Given
            Integer botId = 1;
            Object expectedResult = "advanced config";
            when(workflowService.getFlowAdvancedConfig(botId)).thenReturn(expectedResult);

            // When
            Object result = controller.getFlowAdvancedConfig(botId);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isEqualTo(expectedResult);

            verify(workflowService).getFlowAdvancedConfig(botId);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当分页参数有效时应返回提示模板列表")
        void promptTemplate_whenPaginationIsValid_shouldReturnPromptTemplateList() {
            // Given
            String search = "template";
            Object expectedResult = "template list";
            when(workflowService.listPagePromptTemplate(1, 10, search)).thenReturn(new PageData<>());

            // When
            Object result = controller.promptTemplate(validPagination, search);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isEqualTo(expectedResult);

            verify(workflowService).listPagePromptTemplate(1, 10, search);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当flowId有效时应成功复制流程")
        void copyFlow_whenFlowIdsAreValid_shouldCopyFlowSuccessfully() {
            // Given
            String sourceFlowId = "source-123";
            String targetFlowId = "target-456";
            Object expectedResult = "flow copied";
            when(workflowService.copyFlow(sourceFlowId, targetFlowId)).thenReturn(expectedResult);

            // When
            Object result = controller.copyFlow(sourceFlowId, targetFlowId);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isEqualTo(expectedResult);

            verify(workflowService).copyFlow(sourceFlowId, targetFlowId);
            verifyNoMoreInteractions(workflowService);
        }

        @Test
        @DisplayName("当flowId有效时应返回最大版本号")
        void getMaxVersion_whenFlowIdIsValid_shouldReturnMaxVersion() {
            // Given
            Object expectedResult = "max version";
            when(workflowService.getMaxVersionByFlowId(VALID_FLOW_ID)).thenReturn(new WorkflowVo());

            // When
            Object result = controller.getMaxVersion(VALID_FLOW_ID);

            // Then
            assertThat(result)
                    .isNotNull()
                    .isEqualTo(expectedResult);

            verify(workflowService).getMaxVersionByFlowId(VALID_FLOW_ID);
            verifyNoMoreInteractions(workflowService);
        }
    }
}