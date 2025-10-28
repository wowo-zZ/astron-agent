package com.iflytek.astron.console.hub.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

/**
 * 
 * @TableName custom_speaker
 */
@TableName(value ="custom_speaker")
@Data
public class CustomSpeaker {
    /**
     * 
     */
    @TableId
    private Long id;

    /**
     * 
     */
    private Long botId;

    /**
     * 
     */
    private String name;

    /**
     * 
     */
    private String taskId;

    /**
     * 
     */
    private String assetId;

    /**
     * 
     */
    private Integer trainStatus;

    /**
     * 
     */
    private Integer deleted;

    /**
     * create time
     */
    private Date createTime;

    /**
     * update time
     */
    private Date updateTime;
}