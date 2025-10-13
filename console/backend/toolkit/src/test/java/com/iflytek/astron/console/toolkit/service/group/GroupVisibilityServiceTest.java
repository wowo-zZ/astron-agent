package com.iflytek.astron.console.toolkit.service.group;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.iflytek.astron.console.toolkit.entity.table.group.GroupVisibility;
import com.iflytek.astron.console.toolkit.entity.vo.group.GroupUserTagVO;
import com.iflytek.astron.console.toolkit.handler.UserInfoManagerHandler;
import com.iflytek.astron.console.commons.util.space.SpaceInfoUtil;
import com.iflytek.astron.console.toolkit.mapper.group.GroupVisibilityMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GroupVisibilityServiceTest {

    @Mock
    private GroupVisibilityMapper groupVisibilityMapper;

    // 使用 Spy + InjectMocks：拦截 ServiceImpl 的 getOne/remove/saveBatch
    @Spy
    @InjectMocks
    private GroupVisibilityService service;

    // ---------- 工具：读取 QueryWrapper.last("...") 里追加的 SQL ----------
    private static String readLastSql(Object wrapper) {
        Class<?> c = wrapper.getClass();
        while (c != null) {
            try {
                Field f = c.getDeclaredField("lastSql");
                f.setAccessible(true);
                Object shared = f.get(wrapper);
                return shared == null ? null : shared.toString();
            } catch (NoSuchFieldException ignored) {
                c = c.getSuperclass();
            } catch (IllegalAccessException e) {
                return null;
            }
        }
        return null;
    }

    // ===================== getOnly =====================

    @Test
    @DisplayName("getOnly(QueryWrapper) 应追加 limit 1 并调用 getOne")
    void getOnly_shouldAppendLimitAndCallGetOne() {
        QueryWrapper<GroupVisibility> qw = new QueryWrapper<>();
        GroupVisibility expected = new GroupVisibility();

        // 拦截父类 getOne，校验 last("limit 1")
        doAnswer(inv -> {
            Object arg = inv.getArgument(0);
            assertThat(arg).isInstanceOf(QueryWrapper.class);
            assertThat(readLastSql(arg)).isNotNull().containsIgnoringCase("limit 1");
            return expected;
        }).when(service).getOne(any(QueryWrapper.class));

        GroupVisibility out = service.getOnly(qw);

        assertThat(out).isSameAs(expected);
        verify(service).getOne(any(QueryWrapper.class));
    }

    // ===================== setRepoVisibility =====================

    @Nested
    class SetRepoVisibilityTests {

        @Test
        @DisplayName("visibility=0：应直接返回，不调用 remove/saveBatch")
        void visibilityPrivate_shouldReturnEarly() {
            try (MockedStatic<SpaceInfoUtil> space = mockStatic(SpaceInfoUtil.class)) {
                space.when(SpaceInfoUtil::getSpaceId).thenReturn(123L); // 即便取了也不应影响后续

                service.setRepoVisibility(99L, 5, 0, Arrays.asList("u1", "u2"));

                verify(service, never()).remove(any(Wrapper.class));
                verify(service, never()).saveBatch(anyCollection());
            }
        }



        @Test
        @DisplayName("uids 为空：只删除不保存")
        void emptyUids_shouldOnlyRemove_noSave() {
            try (MockedStatic<SpaceInfoUtil> space = mockStatic(SpaceInfoUtil.class);
                    MockedStatic<UserInfoManagerHandler> user = mockStatic(UserInfoManagerHandler.class)) {

                space.when(SpaceInfoUtil::getSpaceId).thenReturn(null);
                user.when(UserInfoManagerHandler::getUserId).thenReturn("ownerC");

                doReturn(true).when(service).remove(any(LambdaQueryWrapper.class));

                service.setRepoVisibility(1L, 2, 1, Collections.emptyList());

                verify(service).remove(any(Wrapper.class));
                verify(service, never()).saveBatch(anyCollection());
            }
        }
    }

    // ===================== listUser / get*VisibilityList =====================

    @Test
    @DisplayName("listUser：应携带当前用户ID委托给Mapper")
    void listUser_shouldDelegateToMapper_withCurrentUser() {
        try (MockedStatic<UserInfoManagerHandler> user = mockStatic(UserInfoManagerHandler.class)) {
            user.when(UserInfoManagerHandler::getUserId).thenReturn("u-1");

            List<GroupUserTagVO> rows = Arrays.asList(new GroupUserTagVO(), new GroupUserTagVO());
            when(groupVisibilityMapper.listUser("u-1", 5L, 7L)).thenReturn(rows);

            List<GroupUserTagVO> out = service.listUser(5L, 7L);

            assertThat(out).isSameAs(rows);
            verify(groupVisibilityMapper).listUser("u-1", 5L, 7L);
        }
    }

    @Test
    @DisplayName("getRepoVisibilityList：应传递当前用户与 spaceId")
    void getRepoVisibilityList_shouldDelegateWithSpaceId() {
        try (MockedStatic<UserInfoManagerHandler> user = mockStatic(UserInfoManagerHandler.class);
                MockedStatic<SpaceInfoUtil> space = mockStatic(SpaceInfoUtil.class)) {

            user.when(UserInfoManagerHandler::getUserId).thenReturn("u-2");
            space.when(SpaceInfoUtil::getSpaceId).thenReturn(666L);

            List<GroupVisibility> rows = Arrays.asList(new GroupVisibility(), new GroupVisibility());
            when(groupVisibilityMapper.getRepoVisibilityList("u-2", 666L)).thenReturn(rows);

            List<GroupVisibility> out = service.getRepoVisibilityList();

            assertThat(out).isSameAs(rows);
            verify(groupVisibilityMapper).getRepoVisibilityList("u-2", 666L);
        }
    }

    @Test
    @DisplayName("getToolVisibilityList：应仅传递当前用户")
    void getToolVisibilityList_shouldDelegate() {
        try (MockedStatic<UserInfoManagerHandler> user = mockStatic(UserInfoManagerHandler.class)) {
            user.when(UserInfoManagerHandler::getUserId).thenReturn("u-3");

            List<GroupVisibility> rows = Collections.singletonList(new GroupVisibility());
            when(groupVisibilityMapper.getToolVisibilityList("u-3")).thenReturn(rows);

            List<GroupVisibility> out = service.getToolVisibilityList();

            assertThat(out).isSameAs(rows);
            verify(groupVisibilityMapper).getToolVisibilityList("u-3");
        }
    }

    @Test
    @DisplayName("getSquareToolVisibilityList：应仅传递当前用户")
    void getSquareToolVisibilityList_shouldDelegate() {
        try (MockedStatic<UserInfoManagerHandler> user = mockStatic(UserInfoManagerHandler.class)) {
            user.when(UserInfoManagerHandler::getUserId).thenReturn("u-4");

            List<GroupVisibility> rows = Collections.singletonList(new GroupVisibility());
            when(groupVisibilityMapper.getSquareToolVisibilityList("u-4")).thenReturn(rows);

            List<GroupVisibility> out = service.getSquareToolVisibilityList();

            assertThat(out).isSameAs(rows);
            verify(groupVisibilityMapper).getSquareToolVisibilityList("u-4");
        }
    }
}
