package com.iflytek.astron.console.hub.service.bot.impl;

import cn.hutool.core.io.IoUtil;
import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.iflytek.astron.console.commons.constant.ResponseEnum;
import com.iflytek.astron.console.commons.exception.BusinessException;
import com.iflytek.astron.console.commons.util.I18nUtil;
import com.iflytek.astron.console.commons.util.S3ClientUtil;
import com.iflytek.astron.console.hub.dto.bot.BotGenerationDTO;
import com.iflytek.astron.console.hub.dto.bot.PromptStructDTO;
import com.iflytek.astron.console.hub.entity.AiPromptTemplate;
import com.iflytek.astron.console.hub.mapper.AiPromptTemplateMapper;
import com.iflytek.astron.console.hub.service.bot.BotAIService;
import com.iflytek.astron.console.hub.util.BotAIServiceClient;
import com.iflytek.astron.console.hub.util.ImageUtil;
import com.iflytek.astron.console.toolkit.util.RedisUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.text.MessageFormat;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.iflytek.astron.console.commons.constant.ResponseEnum.PARAMETER_ERROR;

/**
 * AI service implementation class for creating intelligent agents
 */
@Slf4j
@Service
public class BotAIServiceImpl implements BotAIService {

    private static final float IMAGE_COMPRESS_SCALE = 0.2f;
    private static final int BASE_IMAGE_SIZE = 1024;

    @Autowired
    private S3ClientUtil s3ClientUtil;

    @Autowired
    private BotAIServiceClient aiServiceClient;

    @Autowired
    private AiPromptTemplateMapper promptTemplateMapper;

    @Autowired
    private RedisUtil redisUtil;

    /**
     * Get prompt template from database with Redis cache
     */
    private String getPromptTemplate(String promptKey) {
        String languageCode = I18nUtil.getLanguage();
        String cacheKey = "prompt_template:" + promptKey + ":" + languageCode;

        String cached = redisUtil.getStr(cacheKey);
        if (cached != null) {
            return cached;
        }

        AiPromptTemplate template = promptTemplateMapper.selectOne(
                new LambdaQueryWrapper<AiPromptTemplate>()
                        .eq(AiPromptTemplate::getPromptKey, promptKey)
                        .eq(AiPromptTemplate::getLanguageCode, languageCode)
                        .eq(AiPromptTemplate::getIsActive, 1));

        String result = null;
        if (template != null) {
            result = template.getPromptContent();
        }

        // Fallback to English if not found
        if (result == null && !"en".equals(languageCode)) {
            template = promptTemplateMapper.selectOne(
                    new LambdaQueryWrapper<AiPromptTemplate>()
                            .eq(AiPromptTemplate::getPromptKey, promptKey)
                            .eq(AiPromptTemplate::getLanguageCode, "en")
                            .eq(AiPromptTemplate::getIsActive, 1));
            if (template != null) {
                result = template.getPromptContent();
            }
        }

        // Fallback to default template
        if (result == null) {
            result = getDefaultPromptTemplate(promptKey);
        }

        redisUtil.put(cacheKey, result, 86400);

        return result;
    }

    /**
     * Format prompt with parameters
     */
    private String formatPrompt(String promptKey, Object... params) {
        try {
            String template = getPromptTemplate(promptKey);

            // Always trim and expand %n to newline
            template = template.trim().replace("%n", System.lineSeparator());

            // Special adaptation for generate input example: keep structure/newlines, support %s or {i}
            boolean isGenInputExample =
                    "input_example_generation".equals(promptKey)
                            || "generate-input-example".equals(promptKey)
                            || "generate_input_example".equals(promptKey);

            if (isGenInputExample) {
                if (template.contains("%s")) {
                    // Use classic formatter to support templates like {{%s}}
                    return String.format(template, params);
                }
                return MessageFormat.format(template, params);
            }

            // Default behavior (backward compatible): normalize spaces to one line
            template = template.replaceAll("\\s+", " ");

            // Keep compatibility with legacy %s templates by converting to MessageFormat
            if (template.contains("%s")) {
                StringBuilder buf = new StringBuilder();
                int from = 0;
                int idx = 0;
                while (true) {
                    int pos = template.indexOf("%s", from);
                    if (pos < 0) {
                        buf.append(template, from, template.length());
                        break;
                    }
                    buf.append(template, from, pos).append('{').append(idx++).append('}');
                    from = pos + 2;
                }
                template = buf.toString();
            }

            return MessageFormat.format(template, params);
        } catch (Exception e) {
            log.error("Failed to format prompt template: {}, error: {}", promptKey, e.getMessage());
            throw new BusinessException(ResponseEnum.SYSTEM_ERROR);
        }
    }

    /**
     * Get field mappings configuration
     */
    private Map<String, List<String>> getFieldMappings() {
        try {
            String content = getPromptTemplate("field_mappings");
            return parseJsonToFieldMappings(content);
        } catch (Exception e) {
            log.warn("Failed to get field mappings from database, using default configuration");
            return getDefaultFieldMappings();
        }
    }

    /**
     * Get bot type mappings configuration
     */
    private Map<String, Integer> getBotTypeMappings() {
        try {
            String content = getPromptTemplate("bot_type_mappings");
            return parseJsonToBotTypeMappings(content);
        } catch (Exception e) {
            log.warn("Failed to get bot type mappings from database, using default configuration");
            return getDefaultBotTypeMappings();
        }
    }

    /**
     * Get PromptStruct labels configuration
     */
    private Map<String, String> getPromptStructLabels() {
        try {
            String content = getPromptTemplate("prompt_struct_labels");
            return parseJsonToPromptStructLabels(content);
        } catch (Exception e) {
            log.warn("Failed to get prompt struct labels from database, using default configuration");
            return getDefaultPromptStructLabels();
        }
    }

    @Override
    public String generateAvatar(String uid, String botName, String botDesc) {
        if (uid == null || StrUtil.isBlank(botName)) {
            return null;
        }

        botDesc = StrUtil.isNotBlank(botDesc) ? botDesc : "Intelligent Assistant";
        String prompt = formatPrompt("avatar_generation", botName, botDesc);

        InputStream imageInput = null;
        InputStream compressImageInput = null;

        try {
            JSONObject response = aiServiceClient.generateImage(uid, prompt, BASE_IMAGE_SIZE);

            // Check response structure
            JSONObject header = response.getJSONObject("header");
            if (header == null) {
                return null;
            }

            int code = header.getIntValue("code");
            String sid = header.getString("sid");
            String message = header.getString("message");

            if (code != 0) {
                log.error("User [{}] AI avatar generation failed, response code: {}, message: {}, sid: {}", uid, code, message, sid);
                return null;
            }

            // Parse payload
            JSONObject payload = response.getJSONObject("payload");
            if (payload == null) {
                return null;
            }

            JSONObject choices = payload.getJSONObject("choices");
            if (choices == null) {
                return null;
            }

            JSONArray textArray = choices.getJSONArray("text");
            if (textArray == null || textArray.isEmpty()) {
                return null;
            }

            JSONObject textItem = textArray.getJSONObject(0);
            if (textItem == null) {
                return null;
            }

            String base64Image = textItem.getString("content");
            if (StrUtil.isBlank(base64Image)) {
                return null;
            }

            log.info("User [{}] received base64 image data, length: {}", uid, base64Image.length());

            // Check if it's really base64 image data
            if (base64Image.length() < 1000) {
                return null;
            }

            // Convert and compress image
            imageInput = ImageUtil.base64ToImageInputStream(base64Image);
            compressImageInput = ImageUtil.compressImage(imageInput, IMAGE_COMPRESS_SCALE);

            // Calculate compressed dimensions
            int compressedWidth = (int) (BASE_IMAGE_SIZE * IMAGE_COMPRESS_SCALE);
            int compressedHeight = (int) (BASE_IMAGE_SIZE * IMAGE_COMPRESS_SCALE);

            // Upload to object storage
            String fileName = "avatar/" + uid + "/" + System.currentTimeMillis() + ".jpg";
            String avatarUrl = s3ClientUtil.uploadObject(fileName, "image/jpeg", compressImageInput);

            avatarUrl = avatarUrl + (avatarUrl.contains("?") ? "&" : "?") +
                    "width=" + compressedWidth + "&height=" + compressedHeight;

            log.info("User [{}] avatar generated and uploaded successfully: {}", uid, avatarUrl);
            return avatarUrl;

        } catch (Exception e) {
            log.error("Exception occurred during AI avatar generation for user [{}]", uid, e);
            return "Should return fallback content";
        } finally {
            IoUtil.close(imageInput);
            IoUtil.close(compressImageInput);
        }
    }

    @Override
    public BotGenerationDTO sentenceBot(String sentence, String uid) {
        if (StringUtils.isBlank(sentence)) {
            throw new BusinessException(PARAMETER_ERROR);
        }

        if (sentence.length() > 2000) {
            log.error("One-sentence assistant generation input too long: length={}", sentence.length());
            throw new BusinessException(PARAMETER_ERROR);
        }

        try {
            // Use AI service to generate assistant configuration
            BotGenerationDTO botDetail = generateBotFromSentence(sentence);

            // Generate AI avatar (optional, enable as needed)
            String botName = botDetail.getBotName();
            String botDesc = botDetail.getBotDesc();
            if (StringUtils.isNotBlank(botName) && StringUtils.isNotBlank(botDesc)) {
                try {
                    String avatarUrl = generateAvatar(uid, botName, botDesc);
                    if (StringUtils.isNotBlank(avatarUrl) && !avatarUrl.equals("Should return fallback content")) {
                        botDetail.setAvatar(avatarUrl);
                    }
                } catch (Exception e) {
                    log.warn("Avatar generation failed, using default avatar: {}", e.getMessage());
                    // Continue execution, don't affect main functionality
                }
            }

            return botDetail;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("One-sentence assistant generation failed: sentence={}", sentence, e);
            throw new BusinessException(PARAMETER_ERROR);
        }
    }

    /**
     * Generate assistant configuration based on one-sentence description
     */
    private BotGenerationDTO generateBotFromSentence(String sentence) throws Exception {
        // Build prompt - use original project prompt logic
        String prompt = formatPrompt("sentence_bot_generation", sentence);

        log.info("Starting one-sentence assistant generation, input: {}", sentence);

        // Call AI service to generate response
        String aiResponse = aiServiceClient.generateText(prompt, "gpt4", 120);

        if (StringUtils.isBlank(aiResponse)) {
            log.error("AI service returned empty response");
            throw new RuntimeException("AI service returned empty response");
        }

        log.info("AI generated response: {}", aiResponse);

        // Parse AI response
        return parseBotConfigFromResponse(aiResponse);
    }

    /**
     * Parse AI response and extract assistant configuration information
     */
    private BotGenerationDTO parseBotConfigFromResponse(String response) {
        BotGenerationDTO botDetail = new BotGenerationDTO();

        try {
            // Get field mappings from database
            Map<String, List<String>> fieldMappings = getFieldMappings();

            // Parse structured response
            String[] lines = response.split("\n");
            String botName = null, botTypeName = null, botDesc = null;
            String roleDesc = null, targetTask = null, requirement = null, inputExample = null;

            for (String line : lines) {
                line = line.trim();

                // Check each field mapping
                if (matchesFieldMapping(line, fieldMappings.get("assistant_name"))) {
                    botName = extractValue(line);
                } else if (matchesFieldMapping(line, fieldMappings.get("assistant_category"))) {
                    botTypeName = extractValue(line);
                } else if (matchesFieldMapping(line, fieldMappings.get("assistant_description"))) {
                    botDesc = extractValue(line);
                } else if (matchesFieldMapping(line, fieldMappings.get("role_setting"))) {
                    roleDesc = extractValue(line);
                } else if (matchesFieldMapping(line, fieldMappings.get("target_task"))) {
                    targetTask = extractValue(line);
                } else if (matchesFieldMapping(line, fieldMappings.get("requirement_description"))) {
                    requirement = extractValue(line);
                } else if (matchesFieldMapping(line, fieldMappings.get("input_examples"))) {
                    inputExample = extractValue(line);
                }
            }

            // Map assistant category to numeric type
            int botType = mapBotType(botTypeName);

            // Build return data
            botDetail.setBotName(StringUtils.isNotBlank(botName) ? botName : "AI Assistant");
            botDetail.setBotDesc(StringUtils.isNotBlank(botDesc) ? botDesc : "Intelligent Assistant");
            botDetail.setBotType(botType);
            botDetail.setPromptType(1);
            botDetail.setSupportContext(0);
            botDetail.setSupportSystem(0);
            botDetail.setVersion(1);
            botDetail.setBotStatus(-9);

            // Build prompt structure
            List<PromptStructDTO> promptStructList = new ArrayList<>();
            Map<String, String> labels = getPromptStructLabels();

            if (StringUtils.isNotBlank(roleDesc)) {
                PromptStructDTO roleStruct = new PromptStructDTO();
                roleStruct.setPromptKey(labels.get("role_setting"));
                roleStruct.setPromptValue(roleDesc);
                promptStructList.add(roleStruct);
            }
            if (StringUtils.isNotBlank(targetTask)) {
                PromptStructDTO targetStruct = new PromptStructDTO();
                targetStruct.setPromptKey(labels.get("target_task"));
                targetStruct.setPromptValue(targetTask);
                promptStructList.add(targetStruct);
            }
            if (StringUtils.isNotBlank(requirement)) {
                PromptStructDTO reqStruct = new PromptStructDTO();
                reqStruct.setPromptKey(labels.get("requirement_description"));
                reqStruct.setPromptValue(requirement);
                promptStructList.add(reqStruct);
            }
            botDetail.setPromptStructList(promptStructList);

            // Process input examples
            if (StringUtils.isNotBlank(inputExample)) {
                String[] examples = inputExample.replace("||", "|").split("\\|");
                List<String> exampleList = new ArrayList<>();
                for (String example : examples) {
                    if (StringUtils.isNotBlank(example.trim()) && exampleList.size() < 3) {
                        exampleList.add(example.trim());
                    }
                }
                botDetail.setInputExample(exampleList);
            } else {
                botDetail.setInputExample(new ArrayList<>());
            }

            log.info("Successfully parsed assistant configuration: botName={}, botType={}", botName, botType);

        } catch (Exception e) {
            log.error("Failed to parse assistant configuration", e);
            // Return basic configuration as fallback
            botDetail.setBotName("AI Assistant");
            botDetail.setBotDesc("Intelligent Assistant");
            botDetail.setBotType(1);
            botDetail.setPromptStructList(new ArrayList<>());
            botDetail.setInputExample(new ArrayList<>());
        }

        return botDetail;
    }

    /**
     * Extract value from line (remove prefix)
     */
    private String extractValue(String line) {
        int colonIndex = Math.max(line.indexOf(":"), line.indexOf("："));
        if (colonIndex > 0 && colonIndex < line.length() - 1) {
            return line.substring(colonIndex + 1).trim();
        }
        return "";
    }

    /**
     * Check if line matches any of the field mapping patterns
     */
    private boolean matchesFieldMapping(String line, List<String> fieldPatterns) {
        if (fieldPatterns == null || fieldPatterns.isEmpty()) {
            return false;
        }
        for (String pattern : fieldPatterns) {
            if (line.startsWith(pattern)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Map assistant category name to numeric type
     */
    private int mapBotType(String botTypeName) {
        if (StringUtils.isBlank(botTypeName)) {
            return 1; // Default type
        }

        // Get bot type mappings from database
        Map<String, Integer> typeMap = getBotTypeMappings();
        return typeMap.getOrDefault(botTypeName, 1);
    }

    @Override
    public String generatePrologue(String botName) {
        if (StringUtils.isBlank(botName)) {
            throw new BusinessException(PARAMETER_ERROR);
        }

        if (StringUtils.length(botName) > 520) {
            throw new BusinessException(PARAMETER_ERROR);
        }

        try {
            String question = formatPrompt("prologue_generation", botName);
            String prologue = String.valueOf(aiServiceClient.generateText(question, "gpt4", 60));

            if (StringUtils.isBlank(prologue)) {
                log.error("Failed to generate prologue: AI returned empty content");
                throw new BusinessException(PARAMETER_ERROR);
            }

            log.info("Robot [{}] prologue generated successfully, length: {}", botName, prologue.length());
            return prologue.trim();

        } catch (BusinessException e) {
            throw e;
        } catch (IllegalArgumentException e) {
            log.error("Parameter error when generating robot [{}] prologue", botName, e);
            throw new BusinessException(PARAMETER_ERROR);
        } catch (Exception e) {
            log.error("Exception occurred when generating robot [{}] prologue", botName, e);
            throw new BusinessException(PARAMETER_ERROR);
        }
    }

    /**
     * Parse JSON content to field mappings
     */
    private Map<String, List<String>> parseJsonToFieldMappings(String jsonContent) {
        try {
            Map<String, List<String>> mappings = new HashMap<>();
            JSONObject jsonObject = JSON.parseObject(jsonContent);
            for (String key : jsonObject.keySet()) {
                JSONArray array = jsonObject.getJSONArray(key);
                List<String> values = new ArrayList<>();
                for (int i = 0; i < array.size(); i++) {
                    values.add(array.getString(i));
                }
                mappings.put(key, values);
            }
            return mappings;
        } catch (Exception e) {
            log.error("Failed to parse field mappings JSON, using default configuration");
            return getDefaultFieldMappings();
        }
    }

    /**
     * Parse JSON content to bot type mappings
     */
    private Map<String, Integer> parseJsonToBotTypeMappings(String jsonContent) {
        try {
            Map<String, Integer> mappings = new HashMap<>();
            JSONObject jsonObject = JSON.parseObject(jsonContent);
            for (String key : jsonObject.keySet()) {
                mappings.put(key, jsonObject.getInteger(key));
            }
            return mappings;
        } catch (Exception e) {
            log.error("Failed to parse bot type mappings JSON, using default configuration");
            return getDefaultBotTypeMappings();
        }
    }

    /**
     * Parse JSON content to prompt struct labels
     */
    private Map<String, String> parseJsonToPromptStructLabels(String jsonContent) {
        try {
            Map<String, String> mappings = new HashMap<>();
            JSONObject jsonObject = JSON.parseObject(jsonContent);
            for (String key : jsonObject.keySet()) {
                mappings.put(key, jsonObject.getString(key));
            }
            return mappings;
        } catch (Exception e) {
            log.error("Failed to parse prompt struct labels JSON, using default configuration");
            return getDefaultPromptStructLabels();
        }
    }

    /**
     * Get default prompt template
     */
    private String getDefaultPromptTemplate(String promptKey) {
        return switch (promptKey) {
            case "avatar_generation" -> """
                    Please generate a professional avatar for an AI assistant named "{0}". Description: {1}. \
                    Requirements: 1.Modern and clean style 2.Harmonious color scheme 3.Professional AI assistant image \
                    4.Suitable for application interface display""";
            case "sentence_bot_generation" -> """
                    Based on the user description: "{0}", please generate a complete AI assistant configuration. \
                    Please output strictly in the following format: Assistant Name: [Concise and clear assistant name] \
                    Assistant Category: [Choose from: Workplace/Learning/Writing/Programming/Lifestyle/Health] \
                    Assistant Description: [One sentence describing the main function] \
                    Role Setting: [Detailed description of role identity and professional background] \
                    Target Task: [Clearly state the main tasks to be completed] \
                    Requirement Description: [Detailed functional requirements and usage scenarios] \
                    Input Examples: [Provide 2-3 possible user input examples, separated by |] \
                    Note: Please ensure each field has specific content, do not use placeholders.""";
            case "prologue_generation" -> """
                    Please generate a friendly and professional opening message for an AI assistant named "{0}". \
                    Requirements: 1.Friendly and natural tone 2.Highlight professional capabilities \
                    3.Guide users to start conversation 4.Keep within 50 words""";
            case "input_example_generation" ->
                """
                        Assistant name as follows:
                        ```
                        {0}
                        ```
                        Assistant description as follows:
                        ```
                        {1}
                        ```
                        Assistant instructions as follows:
                        ```
                        {2}
                        ```
                        Note:
                        An assistant sends an instruction template together with the user's detailed input to a large language model to complete a specific task.
                        The assistant description states what the assistant should accomplish and what the user needs to provide.
                        The assistant instructions are the template sent to the model; the template plus the user's detailed input enable the model to complete the task.

                        Please follow these steps:
                        1. Carefully read the assistant name, description, and instructions to understand the intended task.
                        2. Based on the above, generate three short task descriptions that a user would input when using this assistant.
                        3. Ensure each output matches the assistant task and does not repeat.
                        4. Be specific; avoid vague dimensions only.
                        5. Return results line by line, one description per line.
                        6. Each description must be no more than 20 words. [VERY IMPORTANT!!]
                        7. Be concise and avoid verbosity; use short phrases.

                        Ensure the three user input task descriptions are appropriate for this assistant.
                        Return results in the following format:
                        1.context1
                        2.context2
                        3.context3""";
            default -> throw new BusinessException(ResponseEnum.SYSTEM_ERROR);
        };
    }

    /**
     * Get default field mappings
     */
    private Map<String, List<String>> getDefaultFieldMappings() {
        Map<String, List<String>> mappings = new HashMap<>();
        mappings.put("assistant_name", Arrays.asList("Assistant Name:"));
        mappings.put("assistant_category", Arrays.asList("Assistant Category:"));
        mappings.put("assistant_description", Arrays.asList("Assistant Description:"));
        mappings.put("role_setting", Arrays.asList("Role Setting:"));
        mappings.put("target_task", Arrays.asList("Target Task:"));
        mappings.put("requirement_description", Arrays.asList("Requirement Description:"));
        mappings.put("input_examples", Arrays.asList("Input Examples:"));
        return mappings;
    }

    /**
     * Get default bot type mappings
     */
    private Map<String, Integer> getDefaultBotTypeMappings() {
        Map<String, Integer> mappings = new HashMap<>();
        mappings.put("Workplace", 10);
        mappings.put("Learning", 13);
        mappings.put("Writing", 14);
        mappings.put("Programming", 15);
        mappings.put("Lifestyle", 17);
        mappings.put("Health", 39);
        return mappings;
    }

    /**
     * Get default prompt struct labels
     */
    private Map<String, String> getDefaultPromptStructLabels() {
        Map<String, String> mappings = new HashMap<>();
        mappings.put("role_setting", "Role Setting");
        mappings.put("target_task", "Target Task");
        mappings.put("requirement_description", "Requirement Description");
        return mappings;
    }

    @Override
    public List<String> generateInputExample(String botName, String botDesc, String prompt) {
        if (StringUtils.isBlank(botName) || StringUtils.length(botName) > 128) {
            throw new BusinessException(PARAMETER_ERROR);
        }
        botDesc = StringUtils.defaultString(StringUtils.left(botDesc, 1000));
        prompt = StringUtils.defaultString(StringUtils.left(prompt, 2000));

        try {
            String question = formatPrompt("input_example_generation", botName, botDesc, prompt);
            String answer = aiServiceClient.generateText(question, "gpt4", 60);
            List<String> examples = parseNumberedExamples(answer);
            return examples.size() > 3 ? examples.subList(0, 3) : examples;
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to generate input examples, botName=[{}]", botName, e);
            return Collections.emptyList();
        }
    }

    /**
     * Parse text content and extract up to 3 numbered examples. Supports patterns like: 1. xxx\n2.
     * yyy\n3. zzz (optional 4. ... will be ignored) Fallback: take first 3 non-empty lines.
     */
    private List<String> parseNumberedExamples(String text) {
        List<String> result = new ArrayList<>();
        if (StringUtils.isBlank(text)) {
            return result;
        }

        // Non-greedy capture between markers; DOTALL for multi-line
        Pattern p = Pattern.compile("(?s)1\\.\\s*(.*?)(?:\\n|\r|$)\\s*2\\.\\s*(.*?)(?:\\n|\r|$)\\s*3\\.\\s*(.*?)(?:(?:\\n|\r)\\s*4\\.|$)");
        Matcher m = p.matcher(text);
        if (m.find()) {
            for (int i = 1; i <= 3; i++) {
                String seg = StringUtils.trimToEmpty(m.group(i));
                // Cut potential trailing numbering accidentally captured
                seg = seg.replaceAll("(?s)\\n\\s*[1-9]\\.\\s*.*$", "").trim();
                if (StringUtils.isNotBlank(seg)) {
                    result.add(seg);
                }
            }
        }

        if (result.size() >= 1) {
            return result;
        }

        // Fallback: try simple line-based extraction
        String[] lines = text.split("\r?\n");
        for (String line : lines) {
            String s = StringUtils.trimToEmpty(line);
            if (s.isEmpty())
                continue;
            // leading numbering or dash
            s = s.replaceFirst("^\\s*(?:[0-9]+[\\.)]|[-•])\\s*", "").trim();
            if (!s.isEmpty()) {
                result.add(s);
            }
            if (result.size() == 3)
                break;
        }
        return result;
    }
}
