package io.nexora.backend.ai.client;

import io.nexora.backend.common.exception.AIServiceException;
import org.springframework.web.client.HttpClientErrorException;
import tools.jackson.databind.ObjectMapper;
import io.nexora.backend.ai.config.GeminiProperties;
import io.nexora.backend.ai.dto.request.Content;
import io.nexora.backend.ai.dto.request.GeminiRequest;
import io.nexora.backend.ai.dto.request.Part;
import io.nexora.backend.ai.dto.response.GeminiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GeminiClient implements AIClient {

    private final RestClient restClient;
    private final GeminiProperties properties;
    private final ObjectMapper objectMapper;

    @Override
    public <T> T generate(String prompt, Class<T> responseType) {

        GeminiRequest request = GeminiRequest.builder()
                .contents(List.of(
                        Content.builder()
                                .parts(List.of(
                                        Part.builder()
                                                .text(prompt)
                                                .build()
                                ))
                                .build()
                ))
                .build();

        GeminiResponse response;

        try {

            response = restClient.post()
                    .uri(
                            "https://generativelanguage.googleapis.com/v1beta/models/"
                                    + properties.getModel()
                                    + ":generateContent"
                    )
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("x-goog-api-key", properties.getApiKey())
                    .body(request)
                    .retrieve()
                    .body(GeminiResponse.class);

        } catch (HttpClientErrorException.TooManyRequests e) {

            throw new AIServiceException(
                    "AI service is temporarily unavailable. Please try again later.",
                    e
            );

        } catch (HttpClientErrorException e) {

            throw new AIServiceException(
                    "AI service request failed.",
                    e
            );
        }

        try {
            if (response == null || response.getCandidates() == null || response.getCandidates().isEmpty()
                    || response.getCandidates().get(0).getContent() == null
                    || response.getCandidates().get(0).getContent().getParts() == null
                    || response.getCandidates().get(0).getContent().getParts().isEmpty()
                    || response.getCandidates().get(0).getContent().getParts().get(0).getText() == null) {
                throw new AIServiceException("AI returned an empty response.");
            }

            String json =
                    response.getCandidates()
                            .get(0)
                            .getContent()
                            .getParts()
                            .get(0)
                            .getText();

            if (responseType.equals(String.class)) {
                return responseType.cast(extractPlainText(json));
            }
            String cleaned = json.trim();
            if (cleaned.startsWith("```") && cleaned.endsWith("```")) {
                int newline = cleaned.indexOf('\n');
                cleaned = newline >= 0 ? cleaned.substring(newline + 1, cleaned.length() - 3).trim() : cleaned;
            }
            if (responseType.equals(io.nexora.backend.ai.dto.response.ChatResponse.class)) {
                try {
                    return objectMapper.readValue(cleaned, responseType);
                } catch (Exception ignored) {
                    String reply = extractReplyField(json);
                    if (!reply.isBlank()) {
                        return responseType.cast(io.nexora.backend.ai.dto.response.ChatResponse.builder().reply(reply).build());
                    }
                    return responseType.cast(io.nexora.backend.ai.dto.response.ChatResponse.builder().reply(json.trim()).build());
                }
            }
            return objectMapper.readValue(cleaned, responseType);

        } catch (AIServiceException e) {
            throw e;
        } catch (Exception e) {
            throw new AIServiceException("Failed to parse AI response.", e);

        }

    }
    private String extractPlainText(String raw) {
        String reply = extractReplyField(raw);
        return reply.isBlank() ? raw.trim() : reply;
    }

    private String extractReplyField(String raw) {
        if (raw == null || raw.isBlank()) return "";
        try {
            var node = objectMapper.readTree(raw.trim());
            if (node != null && node.isObject() && node.get("reply") != null) {
                return node.get("reply").asText("").trim();
            }
        } catch (Exception ignored) { }
        java.util.regex.Matcher matcher = java.util.regex.Pattern
                .compile("(?s)(?:\\\"reply\\\"|reply)\\s*:\\s*\\\"((?:\\\\.|[^\\\"\\\\])*)\\\"")
                .matcher(raw);
        if (matcher.find()) {
            String value = matcher.group(1);
            try { return objectMapper.readValue("\"" + value + "\"", String.class).trim(); }
            catch (Exception ignored) { return value.trim(); }
        }
        return "";
    }

}
