package io.nexora.backend.ai.service;

import io.nexora.backend.ai.client.AIClient;
import io.nexora.backend.ai.dto.request.ChatRequest;
import io.nexora.backend.ai.dto.response.ChatResponse;
import io.nexora.backend.ai.prompt.PromptBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AIServiceImpl implements AIService {

    private final AIClient aiClient;
    private final PromptBuilder promptBuilder;


    @Override
    public ChatResponse chat(ChatRequest request) {
        String prompt = promptBuilder.buildChatPrompt(request.getMessage());

        return aiClient.generate(prompt,ChatResponse.class);
    }
}