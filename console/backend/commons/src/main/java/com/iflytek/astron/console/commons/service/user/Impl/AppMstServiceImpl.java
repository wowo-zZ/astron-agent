package com.iflytek.astron.console.commons.service.user.Impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.iflytek.astron.console.commons.entity.user.AppMst;
import com.iflytek.astron.console.commons.mapper.user.AppMstMapper;
import com.iflytek.astron.console.commons.service.user.AppMstService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * @author yun-zhi-ztl
 */
@Service
@Slf4j
public class AppMstServiceImpl implements AppMstService {

    @Autowired
    private AppMstMapper appMstMapper;


    @Override
    public boolean exist(String appName) {
        return appMstMapper.exists(Wrappers.lambdaQuery(AppMst.class)
                .eq(AppMst::getAppName, appName)
                .eq(AppMst::getIsDelete, 0));
    }

    @Override
    public void insert(String uid, String appId, String appName, String appDescribe, String apiKey, String apiSecret) {
        AppMst appMst = new AppMst();
        appMst.setUid(uid);
        appMst.setAppName(appName);
        appMst.setAppDescribe(appDescribe);
        appMst.setAppId(appId);
        appMst.setAppKey(apiKey);
        appMst.setAppSecret(apiSecret);
        appMst.setIsDelete(0);
        appMst.setCreateTime(LocalDateTime.now());
        appMst.setUpdateTime(LocalDateTime.now());
        appMstMapper.insert(appMst);
    }
}
