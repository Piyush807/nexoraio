package io.nexora.backend.ai.service;

import io.nexora.backend.ai.client.AIClient;
import io.nexora.backend.ai.dto.request.ChatRequest;
import io.nexora.backend.ai.dto.response.ChatResponse;
import io.nexora.backend.ai.prompt.PromptBuilder;
import io.nexora.backend.conversation.entity.Message;
import io.nexora.backend.goal.entity.Goal;
import io.nexora.backend.roadmap.dto.response.RoadmapResponse;
import io.nexora.backend.memory.dto.response.GrowthMemoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AIServiceImpl implements AIService {

    private final AIClient aiClient;
    private final PromptBuilder promptBuilder;
    @Override
    public ChatResponse chat(ChatRequest request) {

        String prompt = promptBuilder.buildChatPrompt(request.getMessage());

        return aiClient.generate(prompt, ChatResponse.class);
    }

    @Override
    public ChatResponse chat(List<Message> messages) {

        String prompt = promptBuilder.buildChatPrompt(messages);

        return aiClient.generate(prompt, ChatResponse.class);
    }

    @Override
    public ChatResponse chat(List<Message> messages, Goal goal, RoadmapResponse roadmap) {
        return chat(messages, goal, roadmap, null);
    }

    @Override
    public ChatResponse chat(List<Message> messages, Goal goal, RoadmapResponse roadmap, GrowthMemoryResponse memory) {
        String prompt = promptBuilder.buildChatPrompt(messages, goal, roadmap, memory);
        return aiClient.generate(prompt, ChatResponse.class);
    }

    @Override
    public ChatResponse chat(List<Message> messages, List<Goal> activeGoals) {
        return chat(messages, activeGoals, null);
    }

    @Override
    public ChatResponse chat(List<Message> messages, List<Goal> activeGoals, GrowthMemoryResponse memory) {
        String prompt = promptBuilder.buildChatPrompt(messages, activeGoals, memory);
        return aiClient.generate(prompt, ChatResponse.class);
    }
}
