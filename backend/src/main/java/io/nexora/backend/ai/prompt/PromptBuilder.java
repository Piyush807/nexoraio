package io.nexora.backend.ai.prompt;

import io.nexora.backend.goal.entity.Goal;

public interface PromptBuilder {

    String buildRoadmapPrompt(Goal goal);

    String buildChatPrompt(String prompt);
}
