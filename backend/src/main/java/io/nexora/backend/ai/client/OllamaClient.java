package io.nexora.backend.ai.client;

import io.nexora.backend.ai.dto.request.OllamaRequest;
import io.nexora.backend.ai.dto.response.OllamaResponse;
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

            return objectMapper.readValue(
                    response.getResponse(),
                    responseType
            );

        } catch (Exception e) {

            throw new AIServiceException(
                    "Failed to parse AI response.",
                    e
            );
        }
    }
}