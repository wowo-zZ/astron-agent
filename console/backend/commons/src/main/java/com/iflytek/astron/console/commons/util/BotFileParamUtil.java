package com.iflytek.astron.console.commons.util;

import cn.hutool.core.util.ObjectUtil;

import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import com.iflytek.astron.console.commons.entity.bot.UserLangChainInfo;
import com.iflytek.astron.console.commons.enums.bot.BotUploadEnum;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Slf4j
public class BotFileParamUtil {

    /**
     * Determine if it's a multi-file parameter bot
     *
     * @param botId Bot ID for logging
     * @param extraInputsConfig Extra inputs configuration
     * @return true if it's a multi-file parameter bot, false otherwise
     */
    public static boolean isMultiFileParam(Integer botId, List<JSONObject> extraInputsConfig) {
        if (extraInputsConfig == null || extraInputsConfig.isEmpty()) {
            log.info("botId: {} is eligible for publishing, extraInputsConfig is empty", botId);
            return false;
        }

        long noSupportTypeCount = extraInputsConfig.stream()
                .filter(obj -> MaasUtil.NO_SUPPORT_TYPE.contains(obj.getString("type")))
                .count();
        if (noSupportTypeCount > 0) {
            log.info("schema.type contains basic data type fields, botId: {}", botId);
            return true;
        }
        log.info("botId: {} is eligible for publishing", botId);
        return false;
    }

    /**
     * Get old extraInputsConfig configuration
     *
     * @param userLangChainInfo
     * @return
     */
    public static List<JSONObject> getOldExtraInputsConfig(UserLangChainInfo userLangChainInfo) {
        List<JSONObject> result = new ArrayList<>();
        JSONObject object = JSONObject.parseObject(userLangChainInfo.getExtraInputs());
        int typeInt = 0;
        JSONObject jsonObjects;
        if (object.size() < 5) {
            String key = object.keySet().iterator().next();
            Object value = object.get(key);
            typeInt = MaasUtil.getFileType(String.valueOf(value), object);
            BotUploadEnum uploadEnum = BotUploadEnum.getByValue(typeInt);
            jsonObjects = uploadEnum.toJSONObject();
            jsonObjects.put("required", object.get("required"));
            jsonObjects.put("name", key);
            jsonObjects.put("type", value);

        } else {
            typeInt = MaasUtil.getFileType(String.valueOf(object.get("type")), object);
            BotUploadEnum uploadEnum = BotUploadEnum.getByValue(typeInt);
            jsonObjects = uploadEnum.toJSONObject();

            jsonObjects.put("required", object.get("required"));
            jsonObjects.put("name", object.get("name"));
            jsonObjects.put("type", object.get("type"));
            jsonObjects.put("schema", object.get("schema"));
        }
        result.add(jsonObjects);
        return result;
    }

    /**
     * Merge supportUpload and supportUploadConfig field values, ensuring only one entry per name
     *
     * @param supportUpload Original supportUpload list
     * @param supportUploadConfig Original supportUploadConfig list
     * @return Merged list
     */
    public static List<JSONObject> mergeSupportUploadFields(
            List<JSONObject> supportUpload,
            List<JSONObject> supportUploadConfig) {
        HashMap<String, JSONObject> mergedMap = new HashMap<>();

        // Put supportUpload values into Map
        for (JSONObject item : supportUpload) {
            String name = item.getString("name");
            if (name != null) {
                mergedMap.put(name, item);
            }
        }

        // Put supportUploadConfig values into Map, overriding values with same name
        for (JSONObject item : supportUploadConfig) {
            String name = item.getString("name");
            if (name != null) {
                mergedMap.put(name, item);
            }
        }

        // Return merged list
        return new ArrayList<>(mergedMap.values());
    }

    /**
     * Get new extraInputsConfig configuration
     *
     * @param userLangChainInfo
     * @return
     */
    public static List<JSONObject> getExtraInputsConfig(UserLangChainInfo userLangChainInfo) {
        List<JSONObject> result = new ArrayList<>();
        List<JSONObject> object = JSONArray.parseArray(userLangChainInfo.getExtraInputsConfig(), JSONObject.class);
        for (JSONObject o : object) {
            if (ObjectUtil.isNotEmpty(o.get("name")) && ObjectUtil.isNotEmpty(o.get("type"))) {

                int typeInt = MaasUtil.getFileType(String.valueOf(o.get("type")), o);
                BotUploadEnum uploadEnum = BotUploadEnum.getByValue(typeInt);

                JSONObject jsonObjects = uploadEnum.toJSONObject();
                jsonObjects.put("required", o.get("required"));
                jsonObjects.put("name", o.get("name"));
                jsonObjects.put("type", o.get("type"));
                jsonObjects.put("schema", o.get("schema"));
                result.add(jsonObjects);
            }
        }
        return result;
    }
}
