package com.iflytek.astron.console.toolkit.controller.database;

import com.alibaba.fastjson2.JSONObject;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.iflytek.astron.console.commons.annotation.space.SpacePreAuth;
import com.iflytek.astron.console.commons.response.ApiResult;
import com.iflytek.astron.console.toolkit.common.anno.ResponseResultBody;
import com.iflytek.astron.console.toolkit.entity.dto.database.*;
import com.iflytek.astron.console.toolkit.entity.table.database.DbInfo;
import com.iflytek.astron.console.toolkit.entity.table.database.DbTableField;
import com.iflytek.astron.console.toolkit.entity.vo.database.*;
import com.iflytek.astron.console.toolkit.service.database.DatabaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/db")
@Slf4j
@ResponseResultBody
@Tag(name = "Database Management")
public class DataBaseController {

    @Autowired
    private DatabaseService databaseService;

    @PostMapping("/create")
    @Operation(summary = "Create database")
    @SpacePreAuth(key = "DataBaseController_createDatabase_POST")
    public ApiResult<Void> createDatabase(@RequestBody DatabaseDto databaseDto) {
        databaseService.create(databaseDto);
        return ApiResult.success();
    }

    @GetMapping("/detail")
    @Operation(summary = "Query database details")
    @SpacePreAuth(key = "DataBaseController_getDatabaseInfo_GET")
    public ApiResult<DbInfo> getDatabaseInfo(Long id) {
        return ApiResult.success(databaseService.getDatabaseInfo(id));
    }

    @PostMapping("/update")
    @Operation(summary = "Edit database")
    @SpacePreAuth(key = "DataBaseController_updateDatabase_POST")
    public ApiResult<Void> updateDatabase(@RequestBody DatabaseDto databaseDto) {
        databaseService.updateDateBase(databaseDto);
        return ApiResult.success();
    }

    @GetMapping("/delete")
    @Operation(summary = "Delete database")
    @SpacePreAuth(key = "DataBaseController_deleteDatabase_GET")
    public ApiResult<Void> deleteDatabase(Long id) {
        databaseService.delete(id);
        return ApiResult.success();
    }

    @GetMapping("/copy")
    @Operation(summary = "Copy database")
    public ApiResult<Void> copyDatabase(Long id) {
        databaseService.copyDatabase(id);
        return ApiResult.success();
    }

    @PostMapping("/page-list")
    @Operation(summary = "Query database list")
    @SpacePreAuth(key = "DataBaseController_selectDatabase_POST")
    public ApiResult<Page<DbInfo>> selectDatabase(@RequestBody DataBaseSearchVo dataBaseSearchVo) {
        return ApiResult.success(databaseService.selectPage(dataBaseSearchVo));
    }

    @PostMapping("/create-table")
    @Operation(summary = "Create table")
    @SpacePreAuth(key = "DataBaseController_createDbTable_POST")
    public ApiResult<Void> createDbTable(@RequestBody DbTableDto dbTableDto) {
        databaseService.createDbTable(dbTableDto);
        return ApiResult.success();
    }

    @GetMapping("/table-list")
    @Operation(summary = "Get table list")
    @SpacePreAuth(key = "DataBaseController_getDbTableList_GET")
    public ApiResult<List<DbTableVo>> getDbTableList(Long dbId) {
        return ApiResult.success(databaseService.getDbTableList(dbId));
    }

    @GetMapping("/db_table-list")
    @Operation(summary = "Get user database table information")
    @SpacePreAuth(key = "DataBaseController_getDbTableInfoList_GET")
    public ApiResult<List<DbTableInfoVo>> getDbTableInfoList() {
        return ApiResult.success(databaseService.getDbTableInfoList());
    }


    @PostMapping("/update-table")
    @Operation(summary = "Update table fields")
    @SpacePreAuth(key = "DataBaseController_updateTable_POST")
    public ApiResult<Void> updateTable(@RequestBody DbTableDto dbTableDto) {
        databaseService.updateTable(dbTableDto);
        return ApiResult.success();
    }

    @PostMapping("/import-field-list")
    @Operation(summary = "Import table fields")
    @SpacePreAuth(key = "DataBaseController_importDbTableField_POST")
    public ApiResult<List<DbTableFieldDto>> importDbTableField(MultipartFile file) {
        return ApiResult.success(databaseService.importDbTableField(file));
    }


    @PostMapping("/table-field-list")
    @Operation(summary = "Get table field list")
    @SpacePreAuth(key = "DataBaseController_getDbTableFieldList_POST")
    public ApiResult<Page<DbTableField>> getDbTableFieldList(@RequestBody DataBaseSearchVo dataBaseSearchVo) {
        return ApiResult.success(databaseService.getDbTableFieldList(dataBaseSearchVo));
    }

    @GetMapping("/delete-table")
    @Operation(summary = "Delete table list")
    @SpacePreAuth(key = "DataBaseController_deleteTable_GET")
    public ApiResult<Void> deleteTable(Long id) {
        databaseService.deleteTable(id);
        return ApiResult.success();
    }

    @PostMapping("/operate-table-data")
    @Operation(summary = "Operate table data")
    @SpacePreAuth(key = "DataBaseController_operateTableData_POST")
    public ApiResult<Void> operateTableData(@RequestBody DbTableOperateDto dbTableOperateDto) {
        databaseService.operateTableData(dbTableOperateDto);
        return ApiResult.success();
    }

    @PostMapping("/select-table-data")
    @Operation(summary = "Query table data")
    @SpacePreAuth(key = "DataBaseController_selectTableData_POST")
    public ApiResult<Page<JSONObject>> selectTableData(@RequestBody DbTableSelectDataDto dbTableSelectDataDto) {
        return ApiResult.success(databaseService.selectTableData(dbTableSelectDataDto));
    }

    @GetMapping("/copy-table")
    @Operation(summary = "Copy table")
    public ApiResult<Void> copyTable(Long tbId) {
        databaseService.copyTable(tbId);
        return ApiResult.success();
    }

    @PostMapping("/import-table-data")
    @Operation(summary = "Import table data")
    @SpacePreAuth(key = "DataBaseController_importTableData_POST")
    public ApiResult<Void> importTableData(Long tbId, MultipartFile file, Integer execDev) {
        databaseService.importTableData(tbId, execDev, file);
        return ApiResult.success();
    }

    @PostMapping("/export-table-data")
    @Operation(summary = "Export table data")
    @SpacePreAuth(key = "DataBaseController_exportTableData_POST")
    public void exportTableData(@RequestBody DatabaseExportDto databaseExportDto, HttpServletResponse response) {
        databaseService.exportTableData(databaseExportDto, response);
    }

    @GetMapping("/table-template")
    @Operation(summary = "Get table template file")
    @SpacePreAuth(key = "DataBaseController_getTableTemplateFile_GET")
    public void getTableTemplateFile(HttpServletResponse response, Long tbId) {
        databaseService.getTableTemplateFile(response, tbId);
    }

}
