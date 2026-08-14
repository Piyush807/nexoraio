package io.nexora.backend.ai.service;

import io.nexora.backend.ai.dto.request.ChatRequest;
import io.nexora.backend.ai.dto.response.ChatResponse;
import io.nexora.backend.conversation.entity.Message;
import io.nexora.backend.goal.entity.Goal;
import io.nexora.backend.roadmap.dto.response.RoadmapResponse;

import java.util.List;
public interface AIService {

    ChatResponse chat(ChatRequest request);

    ChatResponse chat(List<Message> messages);

    // Goal- and roadmap-aware chat, used by MessageService for conversations
    // linked to a goal.
    ChatResponse chat(List<Message> messages, Goal goal, RoadmapResponse roadmap);

}
