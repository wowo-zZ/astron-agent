package com.iflytek.astron.console.toolkit.service.common;

import com.iflytek.astron.console.commons.exception.BusinessException;
import com.iflytek.astron.console.toolkit.util.S3Util;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ImageServiceTest {

    @Mock
    S3Util s3UtilClient;
    @InjectMocks
    ImageService service;

    private static final long FIVE_MB = 5L * 1024 * 1024;

    private static MultipartFile mockFile(String name, String contentType, byte[] bytes, Long sizeOverride) throws Exception {
        MultipartFile f = mock(MultipartFile.class);

        // 这两个通常都会被调用，保留严格校验
        when(f.isEmpty()).thenReturn(bytes == null || bytes.length == 0);
        lenient().when(f.getContentType()).thenReturn(contentType);

        // 这些在部分异常用例里不会被调用 → 标记为 lenient，避免未使用桩告警
        lenient().when(f.getOriginalFilename()).thenReturn(name);
        lenient().when(f.getInputStream()).thenReturn(new ByteArrayInputStream(bytes == null ? new byte[0] : bytes));
        lenient().when(f.getSize()).thenReturn(sizeOverride != null ? sizeOverride : (bytes == null ? 0L : (long) bytes.length));

        return f;
    }

    // ------------------ 正常路径 ------------------

    @Test
    @DisplayName("upload - 已知长度：应走 putObject(key, in, size, contentType)，并返回规范的 objectKey")
    void upload_shouldPutWithKnownLength_andReturnObjectKey() throws Exception {
        byte[] data = "pngdata".getBytes();
        MultipartFile file = mockFile("avatar.png", "image/png", data, null);

        String key = service.upload(file);

        assertThat(key).matches(Pattern.compile("^icon/user/sparkBot_[0-9a-f]{32}\\.png$"));
        // 调用的是“已知长度”的重载：第三参是 long，第四参是 String
        verify(s3UtilClient, times(1))
                .putObject(eq(key), any(InputStream.class), eq((long) data.length), eq("image/png"));
        // 不会调用“未知长度”的重载：第三参是 String，第四参是 long
        verify(s3UtilClient, never())
                .putObject(anyString(), any(InputStream.class), anyString(), anyLong());
        verifyNoMoreInteractions(s3UtilClient);
    }

    @Test
    @DisplayName("upload - 未知长度(size=0)：应走 putObject(key, in, contentType, 5MB)，并能由Content-Type推断jpg后缀")
    void upload_shouldFallbackToMultipart_whenSizeIsZero() throws Exception {
        MultipartFile file = mockFile(null, "image/jpeg", "x".getBytes(), 0L); // size=0 触发多段上传

        String key = service.upload(file);

        assertThat(key).matches(Pattern.compile("^icon/user/sparkBot_[0-9a-f]{32}\\.jpg$"));
        verify(s3UtilClient, times(1))
                .putObject(eq(key), any(InputStream.class), eq("image/jpeg"), eq(FIVE_MB));
        verify(s3UtilClient, never())
                .putObject(anyString(), any(InputStream.class), anyLong(), anyString());
        verifyNoMoreInteractions(s3UtilClient);
    }

    @Test
    @DisplayName("upload - Fallback放行：image/bmp 非显式白名单但以 image/ 开头，允许上传（无后缀）")
    void upload_shouldAllowFallbackImageSubtype() throws Exception {
        MultipartFile file = mockFile("file", "image/bmp", "bmp".getBytes(), null);

        String key = service.upload(file);

        // 未能从文件名/类型猜到扩展名 → 没有后缀
        assertThat(key).matches(Pattern.compile("^icon/user/sparkBot_[0-9a-f]{32}$"));
        verify(s3UtilClient).putObject(eq(key), any(InputStream.class), eq(3L), eq("image/bmp"));
    }

    @Test
    @DisplayName("upload - 文件名包含危险字符：仍能得到 svg 后缀并上传成功")
    void upload_shouldSanitizeOriginalName_andKeepSvgExt() throws Exception {
        MultipartFile file = mockFile("../a b/..\\evil?.svg", "image/svg+xml", "svg".getBytes(), null);

        String key = service.upload(file);

        assertThat(key).matches(Pattern.compile("^icon/user/sparkBot_[0-9a-f]{32}\\.svg$"));
        verify(s3UtilClient).putObject(eq(key), any(InputStream.class), eq(3L), eq("image/svg+xml"));
    }

    @Test
    @DisplayName("upload - Content-Type 前后有空格/大小写：应被 normalize 并允许")
    void upload_shouldNormalizeContentType_andAllow() throws Exception {
        MultipartFile file = mockFile("a.jpg", "  image/JPEG  ", "abc".getBytes(), null);

        String key = service.upload(file);

        assertThat(key).matches(Pattern.compile("^icon/user/sparkBot_[0-9a-f]{32}\\.jpg$"));
        // normalize 后传入 putObject 的 Content-Type 应为去空格的原值（大小写保留）
        verify(s3UtilClient).putObject(eq(key), any(InputStream.class), eq(3L), eq("image/JPEG"));
    }

    // ------------------ 边界条件 ------------------

    @Test
    @DisplayName("upload - file==null：抛 BusinessException，且不触达 S3")
    void upload_nullFile_shouldThrow() {
        assertThatThrownBy(() -> service.upload(null))
                .isInstanceOf(BusinessException.class);
        verifyNoInteractions(s3UtilClient);
    }

    @Test
    @DisplayName("upload - 空文件：抛 BusinessException，且不触达 S3")
    void upload_emptyFile_shouldThrow() throws Exception {
        MultipartFile file = mockFile("x.png", "image/png", new byte[0], 0L);
        when(file.isEmpty()).thenReturn(true);

        assertThatThrownBy(() -> service.upload(file))
                .isInstanceOf(BusinessException.class);
        verifyNoInteractions(s3UtilClient);
    }

    @Test
    @DisplayName("upload - contentType=null：不允许，抛 BusinessException")
    void upload_nullContentType_shouldThrow() throws Exception {
        MultipartFile file = mockFile("x", null, "a".getBytes(), null);

        assertThatThrownBy(() -> service.upload(file))
                .isInstanceOf(BusinessException.class);
        verifyNoInteractions(s3UtilClient);
    }

    @Test
    @DisplayName("upload - contentType 为空串：normalize 为 application/octet-stream → 不允许")
    void upload_blankContentType_shouldThrow() throws Exception {
        MultipartFile file = mockFile("x", "   ", "a".getBytes(), null);

        assertThatThrownBy(() -> service.upload(file))
                .isInstanceOf(BusinessException.class);
        verifyNoInteractions(s3UtilClient);
    }

    // ------------------ 异常路径 ------------------

    @Test
    @DisplayName("upload - S3 putObject 抛错：应记录日志并转为 BusinessException(S3_UPLOAD_ERROR)")
    void upload_s3Throws_shouldWrapAsBusinessException() throws Exception {
        MultipartFile file = mockFile("a.png", "image/png", "abc".getBytes(), null);

        // 抛在 putObject 上（已知长度分支）
        doThrow(new RuntimeException("s3 down"))
                .when(s3UtilClient)
                .putObject(anyString(), any(InputStream.class), anyLong(), anyString());

        assertThatThrownBy(() -> service.upload(file))
                .isInstanceOf(BusinessException.class);

        // 至少尝试过调用一次 S3
        verify(s3UtilClient).putObject(anyString(), any(InputStream.class), anyLong(), anyString());
    }
}
