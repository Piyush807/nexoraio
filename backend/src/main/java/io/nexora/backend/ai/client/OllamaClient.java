package io.nexora.backend.ai.client;

import io.nexora.backend.ai.dto.request.OllamaRequest;
import io.nexora.backend.ai.dto.response.OllamaResponse;
import io.nexora.backend.ai.dto.response.ChatResponse;
import io.nexora.backend.common.exception.AIServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.ObjectMapper;

@Service
@Primary
@RequiredArgsConstructor
public class OllamaClient implements AIClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Override
    public <T> T generate(String prompt, Class<T> responseType) {

        OllamaRequest request = OllamaRequest.builder()
                .model("qwen2.5:3b")
                .prompt(prompt)
                .stream(false)
                .build();

        OllamaResponse response;

        try {

            response = restClient.post()
                    .uri("http://localhost:11434/api/generate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .body(OllamaResponse.class);

        } catch (Exception e) {

            throw new AIServiceException(
                    "Local AI service is unavailable.",
                    e
            );
        }

        try {

            String rawResponse = response.getResponse();

            if (responseType.equals(String.class)) {
                return responseType.cast(extractJson(rawResponse));
            }

            String jsonResponse = extractJson(rawResponse);

            if (responseType.equals(ChatResponse.class)) {
                try {
                    return responseType.cast(objectMapper.readValue(jsonResponse, responseType));
                } catch (Exception ignored) {
                    return responseType.cast(ChatResponse.builder()
                            .reply(extractPlainText(rawResponse))
                            .build());
                }
            }

            return objectMapper.readValue(
                    jsonResponse,
                    responseType
            );

        } catch (Exception e) {

            throw new AIServiceException(
                    "Failed to parse AI response.",
                    e
            );
        }
    }

    private String extractJson(String rawResponse) {

        if (rawResponse == null || rawResponse.isBlank()) {
            throw new AIServiceException("AI returned an empty response.");
        }

        String trimmed = rawResponse.trim();

        if (trimmed.startsWith("```")) {
            int firstFenceEnd = trimmed.indexOf('\n');
            int lastFenceStart = trimmed.lastIndexOf("```");
            if (firstFenceEnd >= 0 && lastFenceStart > firstFenceEnd) {
                return trimmed.substring(firstFenceEnd + 1, lastFenceStart).trim();
            }
        }

        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');

        if (start >= 0 && end > start) {
            return trimmed.substring(start, end + 1);
        }

        return trimmed;
    }

    private String extractPlainText(String rawResponse) {
        String cleaned = extractJson(rawResponse);

        if (cleaned.startsWith("{") && cleaned.contains("\"reply\"")) {
            int colonIndex = cleaned.indexOf(':');
            if (colonIndex >= 0) {
                String value = cleaned.substring(colonIndex + 1).trim();
                if (value.startsWith("\"") && value.endsWith("\"")) {
                    return value.substring(1, value.length() - 1);
                }
            }
        }

        return cleaned;
    }
}
