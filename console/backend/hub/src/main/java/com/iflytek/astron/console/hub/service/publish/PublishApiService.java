package com.iflytek.astron.console.hub.service.publish;

import com.iflytek.astron.console.hub.dto.publish.AppListDTO;
import com.iflytek.astron.console.hub.dto.publish.CreateAppVo;

import java.util.List;

/**
 * @author yun-zhi-ztl
 */
public interface PublishApiService {
    Boolean createApp(CreateAppVo createAppVo);

    List<AppListDTO> getAppList();
}
