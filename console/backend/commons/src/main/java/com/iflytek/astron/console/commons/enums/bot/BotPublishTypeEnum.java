package com.iflytek.astron.console.commons.enums.bot;

import lombok.Getter;

/**
 * Bot发布类型枚举 用于区分不同的发布渠道类型
 */
@Getter
public enum BotPublishTypeEnum {

    /**
     * 发布到市场
     */
    MARKET("MARKET", "市场", 1),

    /**
     * 发布为API
     */
    API("API", "API", 2),

    /**
     * 发布到MCP
     */
    MCP("MCP", "MCP", 3),

    /**
     * 发布到飞书
     */
    FEISHU("FEISHU", "飞书", 4),

    /**
     * 发布到微信公众号
     */
    WECHAT("WECHAT", "微信公众号", 5);

    /**
     * 类型代码
     */
    private final String code;

    /**
     * 类型描述
     */
    private final String desc;

    /**
     * 渠道代码（对应数据库中的publish_channel字段）
     */
    private final Integer channelCode;

    BotPublishTypeEnum(String code, String desc, Integer channelCode) {
        this.code = code;
        this.desc = desc;
        this.channelCode = channelCode;
    }

    /**
     * 根据代码获取枚举
     */
    public static BotPublishTypeEnum getByCode(String code) {
        if (code == null) {
            return null;
        }
        for (BotPublishTypeEnum type : values()) {
            if (type.getCode().equals(code)) {
                return type;
            }
        }
        return null;
    }

    /**
     * 根据渠道代码获取枚举
     */
    public static BotPublishTypeEnum getByChannelCode(Integer channelCode) {
        if (channelCode == null) {
            return null;
        }
        for (BotPublishTypeEnum type : values()) {
            if (type.getChannelCode().equals(channelCode)) {
                return type;
            }
        }
        return null;
    }

    /**
     * 判断是否为市场发布
     */
    public static boolean isMarket(String code) {
        return MARKET.getCode().equals(code);
    }
}
