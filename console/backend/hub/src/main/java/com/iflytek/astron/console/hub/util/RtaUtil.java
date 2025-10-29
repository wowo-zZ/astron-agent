package com.iflytek.astron.console.hub.util;


import cn.xfyun.api.RtasrClient;
import cn.xfyun.model.response.rtasr.RtasrResponse;
import cn.xfyun.service.rta.AbstractRtasrWebSocketListener;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.Response;
import okhttp3.WebSocket;
import org.apache.commons.codec.binary.StringUtils;
import org.springframework.stereotype.Component;

import java.io.FileInputStream;
import java.util.concurrent.CountDownLatch;

@Slf4j
@Component
@RequiredArgsConstructor
public class RtaUtil {

    private final RtasrClient rtaClient;

    public String getRtaResult(FileInputStream audioInputStream) {
        StringBuffer finalResult = new StringBuffer();
        CountDownLatch latch = new CountDownLatch(1);
        AbstractRtasrWebSocketListener listener = new AbstractRtasrWebSocketListener() {

            @Override
            public void onSuccess(WebSocket webSocket, String text) {
                RtasrResponse response = JSONObject.parseObject(text, RtasrResponse.class);
                String s = handleAndReturnContent(response.getData(), finalResult);
                log.info("onSuccess: {}", s);
            }

            @Override
            public void onFail(WebSocket webSocket, Throwable t, Response response) {
                latch.countDown();
            }

            @Override
            public void onBusinessFail(WebSocket webSocket, String text) {
                latch.countDown();
            }

            @Override
            public void onClosed() {
                latch.countDown();
            }
        };
        try {
            rtaClient.send(audioInputStream, listener);
            latch.await();
        } catch (Exception e) {
            // Handle exceptions appropriately
            return "Error: " + e.getMessage();
        }

        return finalResult.toString();
    }

    private String handleAndReturnContent(String message, StringBuffer finalResult) {
        StringBuilder tempResult = new StringBuilder();

        try {
            // 解析本次服务端返回的文本内容
            JSONObject messageObj = JSON.parseObject(message);
            JSONObject cn = messageObj.getJSONObject("cn");
            JSONObject st = cn.getJSONObject("st");
            JSONArray rtArr = st.getJSONArray("rt");
            for (int i = 0; i < rtArr.size(); i++) {
                JSONObject rtArrObj = rtArr.getJSONObject(i);
                JSONArray wsArr = rtArrObj.getJSONArray("ws");
                for (int j = 0; j < wsArr.size(); j++) {
                    JSONObject wsArrObj = wsArr.getJSONObject(j);
                    JSONArray cwArr = wsArrObj.getJSONArray("cw");
                    for (int k = 0; k < cwArr.size(); k++) {
                        JSONObject cwArrObj = cwArr.getJSONObject(k);
                        String wStr = cwArrObj.getString("w");
                        tempResult.append(wStr);
                    }
                }
            }

            // 根据中间结果类型更新最终结果
            String type = st.getString("type");
            if (StringUtils.equals("1", type)) {
                // 此时服务端返回的是当前语句的实时转写内容，不保存到最终结果中，返回到调用处进行拼接展示。
                return tempResult.toString();
            } else if (StringUtils.equals("0", type)) {
                // 此时服务端返回的是当前语句的完整转写内容，保存到最终结果中，并返回空字符串。
                finalResult.append(tempResult);
                return "";
            } else {
                log.error("未知的转写响应类型：{}", type);
                return tempResult.toString();
            }
        } catch (Exception e) {
            return message;
        }
    }


}
