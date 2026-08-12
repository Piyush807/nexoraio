package io.nexora.backend.ai.prompt;

import io.nexora.backend.conversation.entity.Message;
import io.nexora.backend.goal.entity.Goal;
import io.nexora.backend.progress.entity.ProgressEntry;
import io.nexora.backend.progress.entity.ProgressTaskEntry;
import io.nexora.backend.roadmap.dto.response.RoadmapResponse;

import java.util.List;
import java.time.LocalDate;

public interface PromptBuilder {

    String buildRoadmapPrompt(Goal goal);

    String buildChatPrompt(String prompt);

    String buildChatPrompt(List<Message> messages);

    String buildDailyCoachPrompt(Goal goal,
                                 RoadmapResponse roadmap,
                                 ProgressEntry latestProgress,
                                 List<ProgressTaskEntry> completedTasks,
                                 List<Message> recentMessages,
                                 LocalDate currentDate);
}
