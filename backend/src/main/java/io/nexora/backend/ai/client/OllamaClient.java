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

            if (response == null || response.getResponse() == null || response.getResponse().isBlank()) {
                throw new AIServiceException("AI returned an empty response.");
            }
            String rawResponse = response.getResponse();

            if (responseType.equals(String.class)) {
                // Daily coach prompts request plain text, but small local models
                // occasionally still return the chat JSON envelope. Never leak
                // that transport envelope into the UI.
                return responseType.cast(extractPlainText(rawResponse));
            }

            String jsonResponse = extractJson(rawResponse);

            if (responseType.equals(ChatResponse.class)) {
                return responseType.cast(parseChatResponse(rawResponse, jsonResponse));
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

    private ChatResponse parseChatResponse(String rawResponse, String jsonResponse) {
        try {
            return objectMapper.readValue(jsonResponse, ChatResponse.class);
        } catch (Exception ignored) {
            String reply = extractReplyField(rawResponse);
            if (!reply.isBlank()) {
                return ChatResponse.builder().reply(reply).build();
            }
            return ChatResponse.builder().reply(rawResponse.trim()).build();
        }
    }

    private String extractPlainText(String rawResponse) {
        String reply = extractReplyField(rawResponse);
        return reply.isBlank() ? rawResponse.trim() : reply;
    }

    private String extractReplyField(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) return "";

        // First use Jackson's tree parser for valid JSON, including escaped
        // characters and multiline replies.
        try {
            var node = objectMapper.readTree(extractJson(rawResponse));
            if (node != null && node.isObject() && node.get("reply") != null) {
                return node.get("reply").asText("").trim();
            }
        } catch (Exception ignored) {
            // Fall through for the common small-model variant: {reply: "..."}
        }

        // Tolerate an unquoted JSON key emitted by a small local model.
        java.util.regex.Matcher matcher = java.util.regex.Pattern
                .compile("(?s)(?:\\\"reply\\\"|reply)\\s*:\\s*\\\"((?:\\\\.|[^\\\"\\\\])*)\\\"")
                .matcher(rawResponse);
        if (matcher.find()) {
            String value = matcher.group(1);
            try {
                return objectMapper.readValue("\"" + value + "\"", String.class).trim();
            } catch (Exception ignored) {
                return value.trim();
            }
        }

        return "";
    }

}
