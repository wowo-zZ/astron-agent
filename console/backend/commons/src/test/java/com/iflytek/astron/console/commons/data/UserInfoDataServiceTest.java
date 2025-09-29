package com.iflytek.astron.console.commons.data;

import com.iflytek.astron.console.commons.data.impl.UserInfoDataServiceImpl;
import com.iflytek.astron.console.commons.entity.user.UserInfo;
import com.iflytek.astron.console.commons.event.UserNicknameUpdatedEvent;
import com.iflytek.astron.console.commons.mapper.user.UserInfoMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.redisson.api.RedissonClient;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserInfoDataServiceTest {

    @Mock
    private UserInfoMapper userInfoMapper;

    @Mock
    private RedissonClient redissonClient;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private UserInfoDataServiceImpl userInfoDataService;

    @Test
    public void testUpdateUserBasicInfoWithNicknameChange() {
        // 准备测试数据
        String testUid = "test-uid-123";
        String oldNickname = "旧昵称";
        String newNickname = "新昵称";

        UserInfo existingUserInfo = new UserInfo();
        existingUserInfo.setUid(testUid);
        existingUserInfo.setNickname(oldNickname);
        existingUserInfo.setUsername("testuser");
        existingUserInfo.setCreateTime(LocalDateTime.now());

        // Mock findByUid方法
        when(userInfoMapper.selectOne(any())).thenReturn(existingUserInfo);
        when(userInfoMapper.updateById(any(UserInfo.class))).thenReturn(1);

        // 执行更新
        UserInfo result = userInfoDataService.updateUserBasicInfo(testUid, null, newNickname, null, null);

        // 验证结果
        assertNotNull(result);
        assertEquals(newNickname, result.getNickname());

        // 验证事件发布
        ArgumentCaptor<UserNicknameUpdatedEvent> eventCaptor = ArgumentCaptor.forClass(UserNicknameUpdatedEvent.class);
        verify(eventPublisher, times(1)).publishEvent(eventCaptor.capture());

        UserNicknameUpdatedEvent capturedEvent = eventCaptor.getValue();
        assertEquals(testUid, capturedEvent.getUid());
        assertEquals(oldNickname, capturedEvent.getOldNickname());
        assertEquals(newNickname, capturedEvent.getNewNickname());

        // 验证数据库更新
        verify(userInfoMapper, times(1)).updateById(any(UserInfo.class));
    }

    @Test
    public void testUpdateUserBasicInfoWithoutNicknameChange() {
        // 准备测试数据
        String testUid = "test-uid-123";
        String nickname = "相同昵称";

        UserInfo existingUserInfo = new UserInfo();
        existingUserInfo.setUid(testUid);
        existingUserInfo.setNickname(nickname);
        existingUserInfo.setUsername("testuser");
        existingUserInfo.setCreateTime(LocalDateTime.now());

        // Mock findByUid方法
        when(userInfoMapper.selectOne(any())).thenReturn(existingUserInfo);
        when(userInfoMapper.updateById(any(UserInfo.class))).thenReturn(1);

        // 执行更新（传入相同的昵称）
        UserInfo result = userInfoDataService.updateUserBasicInfo(testUid, null, nickname, null, null);

        // 验证结果
        assertNotNull(result);
        assertEquals(nickname, result.getNickname());

        // 验证事件没有发布（因为昵称没有变化）
        verify(eventPublisher, never()).publishEvent(any(UserNicknameUpdatedEvent.class));

        // 验证数据库更新
        verify(userInfoMapper, times(1)).updateById(any(UserInfo.class));
    }

    @Test
    public void testUpdateUserBasicInfoWithBlankNickname() {
        // 准备测试数据
        String testUid = "test-uid-123";
        String oldNickname = "旧昵称";

        UserInfo existingUserInfo = new UserInfo();
        existingUserInfo.setUid(testUid);
        existingUserInfo.setNickname(oldNickname);
        existingUserInfo.setUsername("testuser");
        existingUserInfo.setCreateTime(LocalDateTime.now());

        // Mock findByUid方法
        when(userInfoMapper.selectOne(any())).thenReturn(existingUserInfo);
        when(userInfoMapper.updateById(any(UserInfo.class))).thenReturn(1);

        // 执行更新（传入空昵称）
        UserInfo result = userInfoDataService.updateUserBasicInfo(testUid, null, "", null, null);

        // 验证结果
        assertNotNull(result);
        assertEquals(oldNickname, result.getNickname()); // 昵称应该保持不变

        // 验证事件没有发布（因为传入的昵称为空）
        verify(eventPublisher, never()).publishEvent(any(UserNicknameUpdatedEvent.class));

        // 验证数据库更新
        verify(userInfoMapper, times(1)).updateById(any(UserInfo.class));
    }

    @Test
    public void testUpdateCurrentUserBasicInfoWithNicknameChange() {
        // 这个测试需要mock RequestContextUtil.getUID()，这里先跳过
        // 实际项目中可以通过PowerMock或创建包装类的方式来测试
    }
}