package com.iflytek.astron.console.toolkit.service.database;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.event.AnalysisEventListener;
import com.iflytek.astron.console.commons.constant.ResponseEnum;
import com.iflytek.astron.console.commons.exception.BusinessException;
import com.iflytek.astron.console.toolkit.common.constant.CommonConst;
import com.iflytek.astron.console.toolkit.entity.table.database.DbTableField;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Excel file listener for reading structured row data.
 * <p>
 * Responsibilities:
 * <ul>
 * <li>Read Excel rows and convert to structured {@code Map<columnName, value>} to avoid SQL
 * concatenation.</li>
 * <li>Validate headers and required fields.</li>
 * <li>Fill null values with field defaults or type defaults.</li>
 * <li>Enforce a maximum row limit to prevent excessive processing.</li>
 * </ul>
 */
public class DBExcelReadListener extends AnalysisEventListener<Map<Integer, String>> {

    private static final String[] SYSTEM_FIELDS = {"id", "uid", "create_time"};
    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final List<DbTableField> tableFields;
    private final List<Map<String, Object>> rowsSink; // Output container
    private final String uid; // Auto-fill uid for each row
    private final int maxRows; // Row limit (safety control)

    private List<String> expectedHeaders;
    private List<String> notNullFieldsList;

    private int accepted = 0;
    private boolean headerValidated = false;

    /**
     * Recommended constructor: directly loads parsed rows into {@code rowsSink}.
     *
     * @param tableFields table field metadata
     * @param rowsSink container for parsed row results
     * @param uid unique user ID to attach to each row
     * @param maxRows maximum number of rows to accept (minimum 1)
     */
    public DBExcelReadListener(List<DbTableField> tableFields,
            List<Map<String, Object>> rowsSink,
            String uid,
            int maxRows) {
        this.tableFields = Objects.requireNonNull(tableFields);
        this.rowsSink = Objects.requireNonNull(rowsSink);
        this.uid = uid;
        this.maxRows = Math.max(1, maxRows);
    }

    /**
     * Validate header row.
     *
     * @param headMap header row from Excel, mapping column index to column name
     * @param context analysis context
     * @throws IllegalArgumentException if the actual headers do not match the expected headers
     */
    @Override
    public void invokeHeadMap(Map<Integer, String> headMap, AnalysisContext context) {
        List<String> actualHeaders = new ArrayList<>(headMap.values());

        expectedHeaders = tableFields.stream()
                .map(DbTableField::getName)
                .filter(n -> !Arrays.asList(SYSTEM_FIELDS).contains(n))
                .collect(Collectors.toList());

        notNullFieldsList = tableFields.stream()
                .filter(f -> !Arrays.asList(SYSTEM_FIELDS).contains(f.getName()))
                .filter(DbTableField::getIsRequired)
                .map(DbTableField::getName)
                .collect(Collectors.toList());

        // Require exact order matching, consistent with the original logic
        if (!CollectionUtils.isEqualCollection(expectedHeaders, actualHeaders)) {
            throw new IllegalArgumentException("Header mismatch! Expected: " + expectedHeaders + ", Actual: " + actualHeaders);
        } else {
            expectedHeaders = actualHeaders;
        }
        headerValidated = true;
    }

    /**
     * Process each row of Excel data.
     *
     * @param row current row values (column index -> cell value)
     * @param context analysis context
     * @throws BusinessException if headers have not been validated
     */
    @Override
    public void invoke(Map<Integer, String> row, AnalysisContext context) {
        if (!headerValidated) {
            throw new BusinessException(ResponseEnum.RESPONSE_FAILED, "Header not validated. Please check the Excel file.");
        }
        if (accepted >= maxRows) {
            return; // Exceeding limit, ignore subsequent rows to ensure availability
        }

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("uid", uid);

        for (int i = 0; i < expectedHeaders.size(); i++) {
            String header = expectedHeaders.get(i);
            String raw = row.get(i); // Raw cell value (may be null)
            DbTableField meta = tableFields.stream()
                    .filter(f -> f.getName().equals(header))
                    .findFirst()
                    .orElseThrow(() -> new BusinessException(ResponseEnum.RESPONSE_FAILED, "Field " + header + " does not exist!"));

            Object v;
            if (StringUtils.isBlank(raw)) {
                // Null value: required -> use field default; optional -> type default or null
                v = chooseDefault(meta, notNullFieldsList.contains(header));
            } else {
                v = parseByType(raw, meta.getType());
            }
            out.put(header, v);
        }

        rowsSink.add(out);
        accepted++;
    }

    /**
     * Validate after all rows are analyzed.
     *
     * @param analysisContext analysis context
     * @throws IllegalArgumentException if no valid data was parsed
     */
    @Override
    public void doAfterAllAnalysed(AnalysisContext analysisContext) {
        if (accepted == 0) {
            throw new IllegalArgumentException("No valid data found in the file. Please check if Excel data is correct!");
        }
    }

    // —— Helpers: parsing and defaults —— //

    /**
     * Parse a string into the target Java type based on field type.
     *
     * @param s string value
     * @param type field type
     * @return parsed object (Long, BigDecimal, Boolean, LocalDateTime, or String)
     * @throws IllegalArgumentException if parsing fails for unsupported formats
     */
    private Object parseByType(String s, String type) {
        String t = StringUtils.lowerCase(type);
        switch (t) {
            case CommonConst.DBFieldType.INTEGER:
                return Long.parseLong(s.trim());
            case CommonConst.DBFieldType.NUMBER:
                return new BigDecimal(s.trim());
            case CommonConst.DBFieldType.BOOLEAN:
                return parseBoolean(s);
            case CommonConst.DBFieldType.TIME:
                // Require standard format to avoid ambiguous parsing
                return LocalDateTime.parse(s.trim(), TS);
            default:
                return s; // Keep original string
        }
    }

    /**
     * Choose default value based on field metadata.
     *
     * @param f field definition
     * @param required whether the field is required
     * @return default value based on configuration or type
     */
    private Object chooseDefault(DbTableField f, boolean required) {
        String t = StringUtils.lowerCase(f.getType());
        String def = f.getDefaultValue();

        if (StringUtils.isNotBlank(def)) {
            // User provided default: try to parse according to field type
            try {
                return parseByType(def, t);
            } catch (Exception ignore) {
                // Fallback: treat as string
                return def;
            }
        }

        // No configured default
        if (required) {
            // Required but empty: provide type default value
            switch (t) {
                case CommonConst.DBFieldType.INTEGER:
                    return 0L;
                case CommonConst.DBFieldType.NUMBER:
                    return BigDecimal.ZERO;
                case CommonConst.DBFieldType.BOOLEAN:
                    return Boolean.FALSE;
                case CommonConst.DBFieldType.TIME:
                    return LocalDateTime.now();
                default:
                    return ""; // String defaults to empty string
            }
        } else {
            // Optional: allow null (depending on downstream persistence rules)
            switch (t) {
                case CommonConst.DBFieldType.INTEGER:
                case CommonConst.DBFieldType.NUMBER:
                case CommonConst.DBFieldType.BOOLEAN:
                case CommonConst.DBFieldType.TIME:
                    return null;
                default:
                    return ""; // Empty string is more user-friendly
            }
        }
    }

    /**
     * Parse a string into Boolean.
     *
     * @param s string representation
     * @return Boolean true/false
     * @throws IllegalArgumentException if the value cannot be interpreted as Boolean
     */
    private Boolean parseBoolean(String s) {
        String x = s.trim().toLowerCase(Locale.ROOT);
        if (x.equals("1") || x.equals("true") || x.equals("t") || x.equals("yes") || x.equals("y"))
            return Boolean.TRUE;
        if (x.equals("0") || x.equals("false") || x.equals("f") || x.equals("no") || x.equals("n"))
            return Boolean.FALSE;
        throw new BusinessException(ResponseEnum.RESPONSE_FAILED, "Cannot parse boolean value: " + s);
    }
}
