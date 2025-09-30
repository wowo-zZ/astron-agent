package com.iflytek.astron.console.hub.service.publish.impl;

import com.iflytek.astron.console.commons.constant.ResponseEnum;
import com.iflytek.astron.console.commons.entity.bot.ChatBotBase;
import com.iflytek.astron.console.commons.entity.bot.DatasetInfo;
import com.iflytek.astron.console.commons.entity.user.AppMst;
import com.iflytek.astron.console.commons.exception.BusinessException;
import com.iflytek.astron.console.commons.mapper.bot.BotDatasetMapper;
import com.iflytek.astron.console.commons.service.bot.ChatBotDataService;
import com.iflytek.astron.console.commons.service.user.AppMstService;
import com.iflytek.astron.console.commons.util.RequestContextUtil;
import com.iflytek.astron.console.commons.util.space.SpaceInfoUtil;
import com.iflytek.astron.console.hub.dto.publish.AppListDTO;
import com.iflytek.astron.console.hub.dto.publish.BotApiInfoDTO;
import com.iflytek.astron.console.hub.dto.publish.CreateAppVo;
import com.iflytek.astron.console.hub.dto.publish.CreateBotApiVo;
import com.iflytek.astron.console.hub.dto.user.TenantAuth;
import com.iflytek.astron.console.hub.enums.BotVersionEnum;
import com.iflytek.astron.console.hub.service.chat.ChatBotApiService;
import com.iflytek.astron.console.hub.service.publish.PublishApiService;
import com.iflytek.astron.console.hub.service.publish.TenantService;
import com.iflytek.astron.console.toolkit.util.RedisUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
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

    @Autowired
    private RedisUtil redisUtil;

    @Autowired
    private ChatBotDataService chatBotDataService;

    @Autowired
    private ChatBotApiService chatBotApiService;

    @Autowired
    private BotDatasetMapper botDatasetMapper;

    private static final String PUBLISH_API = "publish_api";

    private static final String BOT_API_CBM_BASE_URL = "ws(s)://spark-openapi.cn-huabei-1.xf-yun.com";

    private static final String BOT_API_MASS_BASE_URL = "http(s)://xingchen-api.xf-yun.com";

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
        return appMstService.getAppListByUid(uid)
                .stream()
                .map(appMst -> new AppListDTO(appMst.getAppId(), appMst.getAppName(), appMst.getAppDescribe()))
                .collect(Collectors.toList());
    }

    @Override
    public BotApiInfoDTO createBotApi(CreateBotApiVo createBotApiVo) {
        String uid = RequestContextUtil.getUID();
        String uuid = UUID.randomUUID().toString();
        String teamCreateUid = SpaceInfoUtil.getUidByCurrentSpaceId();
        // Only the space creator can publish APIs
        if (!uid.equals(teamCreateUid)) {
            throw new BusinessException(ResponseEnum.USER_NO_APPROVEL);
        }

        ChatBotBase botBase = chatBotDataService.findOne(uid, createBotApiVo.getBotId());
        if (botBase == null) {
            throw new BusinessException(ResponseEnum.BOT_NOT_EXISTS);
        }

        boolean existsFlag = chatBotApiService.exists(createBotApiVo.getBotId());
        if (existsFlag && !botBase.getVersion().equals(BotVersionEnum.WORKFLOW.getVersion())) {
            throw new BusinessException(ResponseEnum.BOT_API_CREATE_REPEAT);
        }

        AppMst appMst = appMstService.getByAppId(uid, createBotApiVo.getAppId());
        if (appMst == null) {
            throw new BusinessException(ResponseEnum.USER_APP_ID_NOT_EXISTE);
        }

        if (!redisUtil.tryLock(PUBLISH_API + uid, 3000, uuid)) {
            throw new BusinessException(ResponseEnum.BOT_API_CREATE_LIMIT_ERROR);
        }
        try {
            if (botBase.getVersion().equals(BotVersionEnum.BASE_BOT.getVersion())) {
                return createBaseBotApi(uid, appMst, botBase);
            } else if (botBase.getVersion().equals(BotVersionEnum.WORKFLOW.getVersion())) {
                if (!existsFlag) {
                    return createMaasApi(uid, appMst, botBase);
                } else {
                    return updateMaasApi(uid, appMst, botBase);
                }
            } else {
                throw new BusinessException(ResponseEnum.BOT_TYPE_NOT_EXISTS);
            }

        } catch (Exception e) {
            log.error("PublishApiServiceImpl.createBotApi : create Bot api error, request: {}", createBotApiVo, e);
            throw new BusinessException(ResponseEnum.BOT_API_CREATE_ERROR);
        } finally {
            redisUtil.unlock(PUBLISH_API + uid, uuid);
        }

    }

    private BotApiInfoDTO createMaasApi(String uid, AppMst appMst, ChatBotBase botBase) {
        return null;
    }

    private BotApiInfoDTO updateMaasApi(String uid, AppMst appMst, ChatBotBase botBase) {
        return null;
    }

    private BotApiInfoDTO createBaseBotApi(String uid, AppMst appMst, ChatBotBase botBase) throws IOException {
        Integer botId = botBase.getId();
        String prompt = botBase.getPrompt();
        Long count = chatBotApiService.selectCount(botId);
        if (count != null && count.intValue() >= 100) {
            throw new BusinessException(ResponseEnum.BOT_API_CREATE_ERROR);
        }

        List<DatasetInfo> datasetInfos = botDatasetMapper.selectDatasetListByBotId(botId);
        List<Long> datasetIdList = datasetInfos.stream().map(DatasetInfo::getId).toList();
        String embeddingIds = StringUtils.defaultString(datasetIdList.stream().map(Objects::toString).collect(Collectors.joining(",")), "");

        chatBotApiService.insert(uid, botId, null, appMst.getAppId(),
                appMst.getAppSecret(), appMst.getAppKey(), prompt, "", embeddingIds,
                null, botBase.getBotName());

        // TODO: capability authorization

        String serviceUrlHost = botBase.getVersion() == 1 ? BOT_API_CBM_BASE_URL : BOT_API_MASS_BASE_URL;
        return BotApiInfoDTO.builder()
                .botId(botId).botName(botBase.getBotName()).appName(appMst.getAppName())
                .appId(appMst.getAppId()).appKey(appMst.getAppKey())
                .appSecret(appMst.getAppSecret()).serviceUrl(serviceUrlHost)
                .flowId(null).build();
    }
}
