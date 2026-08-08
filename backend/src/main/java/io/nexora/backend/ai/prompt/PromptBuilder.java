package io.nexora.backend.ai.prompt;

import io.nexora.backend.conversation.entity.Message;
import io.nexora.backend.goal.entity.Goal;

import java.util.List;

public interface PromptBuilder {

    String buildRoadmapPrompt(Goal goal);

    String buildChatPrompt(String prompt);
}