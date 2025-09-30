package com.iflytek.astron.console.hub.dto.user;

import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;

/**
 * Batch import for inviting users
 */
@Data
public class UserInfoExcelDTO {

    @ExcelProperty("Mobile")
    private String mobile;

    @ExcelProperty("Username")
    private String username;
}
