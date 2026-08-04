package io.nexora.backend.ai.client;

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

        GeminiResponse response = restClient.post()
                .uri(
                        "https://generativelanguage.googleapis.com/v1beta/models/"
                                + properties.getModel()
                                + ":generateContent?key="
                                + properties.getApiKey()
                )
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(GeminiResponse.class);

        try {

            String json =
                    response.getCandidates()
                            .getFirst()
                            .getContent()
                            .getParts()
                            .getFirst()
                            .getText();

            return objectMapper.readValue(json, responseType);

        } catch (Exception e) {

            throw new RuntimeException("Failed to parse Gemini response", e);

        }

    }
}