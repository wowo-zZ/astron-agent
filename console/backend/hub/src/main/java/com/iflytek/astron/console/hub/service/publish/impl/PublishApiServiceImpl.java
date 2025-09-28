package com.iflytek.astron.console.hub.service.publish.impl;

import com.iflytek.astron.console.commons.constant.ResponseEnum;
import com.iflytek.astron.console.commons.exception.BusinessException;
import com.iflytek.astron.console.commons.service.user.AppMstService;
import com.iflytek.astron.console.commons.util.RequestContextUtil;
import com.iflytek.astron.console.hub.dto.publish.AppListDTO;
import com.iflytek.astron.console.hub.dto.publish.CreateAppVo;
import com.iflytek.astron.console.hub.dto.user.TenantAuth;
import com.iflytek.astron.console.hub.service.publish.PublishApiService;
import com.iflytek.astron.console.hub.service.publish.TenantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author yun-zhi-ztl
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PublishApiServiceImpl implements PublishApiService {

    @Autowired
    private AppMstService appMstService;

    @Autowired
    private TenantService tenantService;

    @Override
    public Boolean createApp(CreateAppVo createAppVo) {
        String uid = RequestContextUtil.getUID();

        if (appMstService.exist(createAppVo.getAppName())) {
            throw new BusinessException(ResponseEnum.USER_APP_NAME_REPEAT);
        }

        String appId = tenantService.createApp(uid, createAppVo.getAppName(), createAppVo.getAppDescribe());
        if (appId == null) {
            throw new BusinessException(ResponseEnum.USER_APP_ID_CREATE_ERROR);
        }
        TenantAuth tenantAuth = tenantService.getAppDetail(appId);
        if (tenantAuth == null) {
            throw new BusinessException(ResponseEnum.USER_APP_ID_CREATE_ERROR);
        }
        appMstService.insert(uid, appId, createAppVo.getAppName(), createAppVo.getAppDescribe(), tenantAuth.getApiKey(), tenantAuth.getApiSecret());

        return true;
    }

    @Override
    public List<AppListDTO> getAppList() {
        String uid = RequestContextUtil.getUID();
        return appMstService.getAppListByUid(uid).stream()
                .map(appMst -> new AppListDTO(appMst.getAppId(), appMst.getAppName(), appMst.getAppDescribe()))
                .collect(Collectors.toList());
    }
}
