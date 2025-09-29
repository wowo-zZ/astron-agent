package com.iflytek.astron.console.hub.event;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.iflytek.astron.console.commons.data.UserInfoDataService;
import com.iflytek.astron.console.commons.entity.space.EnterpriseUser;
import com.iflytek.astron.console.commons.entity.space.SpaceUser;
import com.iflytek.astron.console.commons.entity.user.UserInfo;
import com.iflytek.astron.console.commons.mapper.space.EnterpriseUserMapper;
import com.iflytek.astron.console.commons.mapper.space.SpaceUserMapper;
import com.iflytek.astron.console.commons.mapper.user.UserInfoMapper;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@SpringBootTest
@ActiveProfiles("test")
public class UserNicknameEventTest {

    private static final Logger log = LoggerFactory.getLogger(UserNicknameEventTest.class);

    @Autowired
    private UserInfoDataService userInfoDataService;

    @Autowired
    private UserInfoMapper userInfoMapper;

    @Autowired
    private EnterpriseUserMapper enterpriseUserMapper;

    @Autowired
    private SpaceUserMapper spaceUserMapper;

    @Test
    @Transactional
    public void testNicknameUpdateEvent() throws InterruptedException {
        // 创建测试数据
        String testUid = "test-uid-" + System.currentTimeMillis();
        String oldNickname = "旧昵称";
        String newNickname = "新昵称";

        // 1. 创建用户信息
        UserInfo userInfo = new UserInfo();
        userInfo.setUid(testUid);
        userInfo.setUsername("testuser");
        userInfo.setNickname(oldNickname);
        userInfo.setCreateTime(LocalDateTime.now());
        userInfo.setUpdateTime(LocalDateTime.now());
        userInfoMapper.insert(userInfo);

        // 2. 创建相关的企业用户记录
        EnterpriseUser enterpriseUser = new EnterpriseUser();
        enterpriseUser.setEnterpriseId(1L);
        enterpriseUser.setUid(testUid);
        enterpriseUser.setNickname(oldNickname);
        enterpriseUser.setRole(3);
        enterpriseUser.setCreateTime(LocalDateTime.now());
        enterpriseUser.setUpdateTime(LocalDateTime.now());
        enterpriseUserMapper.insert(enterpriseUser);

        // 3. 创建相关的空间用户记录
        SpaceUser spaceUser = new SpaceUser();
        spaceUser.setSpaceId(1L);
        spaceUser.setUid(testUid);
        spaceUser.setNickname(oldNickname);
        spaceUser.setRole(3);
        spaceUser.setCreateTime(LocalDateTime.now());
        spaceUser.setUpdateTime(LocalDateTime.now());
        spaceUserMapper.insert(spaceUser);

        log.info("创建测试数据完成，uid: {}, oldNickname: {}", testUid, oldNickname);

        // 5. 更新用户昵称，这应该触发事件
        userInfoDataService.updateUserBasicInfo(testUid, null, newNickname, null, null);

        log.info("触发昵称更新事件，等待异步处理...");

        // 6. 等待异步事件处理完成
        TimeUnit.SECONDS.sleep(2);

        // 7. 验证相关表中的昵称是否已更新
        EnterpriseUser updatedEnterpriseUser = enterpriseUserMapper.selectOne(
                new LambdaQueryWrapper<EnterpriseUser>()
                        .eq(EnterpriseUser::getUid, testUid)
        );
        assert updatedEnterpriseUser != null;
        assert newNickname.equals(updatedEnterpriseUser.getNickname()) :
                "企业用户昵称未更新: " + updatedEnterpriseUser.getNickname();

        SpaceUser updatedSpaceUser = spaceUserMapper.selectOne(
                new LambdaQueryWrapper<SpaceUser>()
                        .eq(SpaceUser::getUid, testUid)
        );
        assert updatedSpaceUser != null;
        assert newNickname.equals(updatedSpaceUser.getNickname()) :
                "空间用户昵称未更新: " + updatedSpaceUser.getNickname();

        log.info("昵称同步测试通过！所有相关表的昵称已成功更新为: {}", newNickname);
    }
}