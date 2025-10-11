package com.iflytek.astron.console.commons.dto.chat;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

/**
 * @author mingsuiyongheng
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatListCreateResponse {
    private Long id;
    private String title;
    private Integer enable;
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private LocalDateTime createTime;
    private boolean isOldBlankList = false;

    private String fileId;

    private Integer botId;

    private Long personalityId;

    private Long gclId;

}
