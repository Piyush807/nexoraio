package io.nexora.backend.ai.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@ConfigurationProperties(prefix = "gemini")
@Data
public class GeminiProperties {

    private String apiKey;
    private String model;

}
