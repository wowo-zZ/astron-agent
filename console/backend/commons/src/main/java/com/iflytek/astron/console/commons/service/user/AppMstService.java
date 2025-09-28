package com.iflytek.astron.console.commons.service.user;

/**
 * @author yun-zhi-ztl
 */
public interface AppMstService {
    boolean exist(String appName);

    void insert(String uid, String appId, String appName, String appDescribe, String apiKey, String apiSecret);
}
