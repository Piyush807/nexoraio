package io.nexora.backend.ai.service;

import io.nexora.backend.ai.dto.request.ChatRequest;
import io.nexora.backend.ai.dto.response.ChatResponse;
import io.nexora.backend.conversation.entity.Message;
import io.nexora.backend.goal.entity.Goal;
import io.nexora.backend.roadmap.dto.response.RoadmapResponse;
import io.nexora.backend.memory.dto.response.GrowthMemoryResponse;

import java.util.List;
public interface AIService {

    ChatResponse chat(ChatRequest request);

    ChatResponse chat(List<Message> messages);

    // Goal- and roadmap-aware chat, used by MessageService for conversations
    // linked to a goal.
    ChatResponse chat(List<Message> messages, Goal goal, RoadmapResponse roadmap);

    ChatResponse chat(List<Message> messages, Goal goal, RoadmapResponse roadmap, GrowthMemoryResponse memory);

    // Portfolio-aware chat, used by MessageService for conversations that
    // aren't linked to any single goal.
    ChatResponse chat(List<Message> messages, List<Goal> activeGoals);

    ChatResponse chat(List<Message> messages, List<Goal> activeGoals, GrowthMemoryResponse memory);

}
