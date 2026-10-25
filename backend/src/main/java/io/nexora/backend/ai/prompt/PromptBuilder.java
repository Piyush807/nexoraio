package io.nexora.backend.ai.prompt;

import io.nexora.backend.conversation.entity.Message;
import io.nexora.backend.goal.entity.Goal;
import io.nexora.backend.progress.entity.ProgressEntry;
import io.nexora.backend.progress.entity.ProgressTaskEntry;
import io.nexora.backend.roadmap.dto.response.RoadmapResponse;
import io.nexora.backend.memory.dto.response.GrowthMemoryResponse;

import java.util.List;
import java.time.LocalDate;

public interface PromptBuilder {

    String buildRoadmapPrompt(Goal goal);

    String buildChatPrompt(String prompt);

    String buildChatPrompt(List<Message> messages);

    // Goal- and roadmap-aware chat prompt, used by MessageService so regular
    // conversations linked to a goal know that goal's roadmap, not just raw
    // message history.
    String buildChatPrompt(List<Message> messages, Goal goal, RoadmapResponse roadmap);

    String buildChatPrompt(List<Message> messages, Goal goal, RoadmapResponse roadmap, GrowthMemoryResponse memory);

    // Portfolio-aware chat prompt, used by MessageService for conversations
    // that are NOT linked to a single goal — gives the assistant visibility
    // into all of the user's active goals at once, so a general question
    // ("what should I focus on today") can draw on the whole picture
    // instead of getting a context-free answer.
    String buildChatPrompt(List<Message> messages, List<Goal> activeGoals);

    String buildChatPrompt(List<Message> messages, List<Goal> activeGoals, GrowthMemoryResponse memory);

    String buildDailyCoachPrompt(Goal goal,
                                 RoadmapResponse roadmap,
                                 ProgressEntry latestProgress,
                                 List<ProgressTaskEntry> completedTasks,
                                 List<Message> recentMessages,
                                 LocalDate currentDate);

    String buildDailyCoachPrompt(Goal goal,
                                 RoadmapResponse roadmap,
                                 ProgressEntry latestProgress,
                                 List<ProgressTaskEntry> completedTasks,
                                 List<Message> recentMessages,
                                 LocalDate currentDate,
                                 GrowthMemoryResponse memory);

}
