package com.iflytek.astron.console.commons.service.user.Impl;

import com.iflytek.astron.console.commons.mapper.user.AppMstMapper;
import com.iflytek.astron.console.commons.service.user.AppMstService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author yun-zhi-ztl
 */
@Service
@Slf4j
public class AppMstServiceImpl implements AppMstService {

    @Autowired
    private AppMstMapper appMstMapper;
    

}
