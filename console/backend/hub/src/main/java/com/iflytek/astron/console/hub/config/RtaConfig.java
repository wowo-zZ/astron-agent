package com.iflytek.astron.console.hub.config;

import cn.xfyun.api.RtasrClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RtaConfig {


    @Value("${spark.rtasr-appId}")
    private String appId;

    @Value("${spark.rtasr-key}")
    private String rtasrApikey;
    
    
    @Bean
    public RtasrClient rtaClient() {
        return new RtasrClient.Builder()
                .signature("appId", "rtasrApikey")
                .build();
    }
    
}
