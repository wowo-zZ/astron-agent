package com.iflytek.astron.console.hub.config;

import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.util.HashMap;
import java.util.Map;

/**
 * Model configuration for loading multiple model settings from environment variables
 * Supports MODEL_0_*, MODEL_1_*, MODEL_2_*, etc.
 */
@Configuration
@Data
@Slf4j
public class ModelConfig {

    @Autowired
    private Environment environment;

    private Map<String, ModelProperties> models = new HashMap<>();

    /**
     * Initialize model configurations from environment variables
     * Scans for MODEL_0_*, MODEL_1_*, etc. patterns
     */
    @PostConstruct
    public void init() {
        // Scan for up to 100 model configurations (MODEL_0 to MODEL_99)
        for (int i = 0; i < 100; i++) {
            String nameKey = "MODEL_" + i + "_NAME";
            String name = environment.getProperty(nameKey);

            // If MODEL_X_NAME doesn't exist, assume no more models
            if (name == null || name.isEmpty()) {
                continue;
            }

            ModelProperties props = new ModelProperties();
            props.setName(name);
            props.setDomain(environment.getProperty("MODEL_" + i + "_DOMAIN"));
            props.setIcon(environment.getProperty("MODEL_" + i + "_ICON"));
            props.setUrl(environment.getProperty("MODEL_" + i + "_URL"));
            props.setApikey(environment.getProperty("MODEL_" + i + "_APIKEY"));

            models.put(String.valueOf(i), props);
            log.info("Loaded model configuration: MODEL_{} - {}", i, name);
        }

        if (models.isEmpty()) {
            log.warn("No model configurations found in environment variables");
        } else {
            log.info("Total {} model(s) loaded", models.size());
        }
    }

    /**
     * Get model properties by index
     * @param index the model index (0, 1, 2, etc.)
     * @return ModelProperties or null if not found
     */
    public ModelProperties getModel(int index) {
        return models.get(String.valueOf(index));
    }

    /**
     * Get model properties by string key
     * @param key the model key (e.g., "0", "1", "2")
     * @return ModelProperties or null if not found
     */
    public ModelProperties getModel(String key) {
        return models.get(key);
    }

    /**
     * Get all configured models
     * @return map of all model configurations
     */
    public Map<String, ModelProperties> getAllModels() {
        return models;
    }

    /**
     * Check if a model exists
     * @param index the model index
     * @return true if model exists
     */
    public boolean hasModel(int index) {
        return models.containsKey(String.valueOf(index));
    }

    /**
     * Properties for a single model configuration
     */
    @Data
    public static class ModelProperties {
        /**
         * Model name (e.g., deepseek-v3)
         */
        private String name;

        /**
         * Model domain (e.g., deepseek-chat)
         */
        private String domain;

        /**
         * Model icon URL
         */
        private String icon;

        /**
         * Model API URL
         */
        private String url;

        /**
         * Model API key
         */
        private String apikey;
    }
}