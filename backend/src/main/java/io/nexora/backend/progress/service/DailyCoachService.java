package io.nexora.backend.progress.service;

import io.nexora.backend.ai.client.AIClient;
import io.nexora.backend.ai.dto.response.ChatResponse;
import io.nexora.backend.ai.prompt.PromptBuilder;
import io.nexora.backend.common.exception.ResourceNotFoundException;
import io.nexora.backend.goal.entity.Goal;
import io.nexora.backend.goal.repository.GoalRepository;
import io.nexora.backend.conversation.entity.Conversation;
import io.nexora.backend.conversation.entity.Message;
import io.nexora.backend.conversation.repository.ConversationRepository;
import io.nexora.backend.conversation.repository.MessageRepository;
import io.nexora.backend.progress.entity.ProgressEntry;
import io.nexora.backend.progress.entity.ProgressTaskEntry;
import io.nexora.backend.progress.repository.ProgressEntryRepository;
import io.nexora.backend.progress.repository.ProgressTaskEntryRepository;
import io.nexora.backend.roadmap.dto.response.RoadmapResponse;
import io.nexora.backend.roadmap.service.RoadmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DailyCoachService {

    private final GoalRepository goalRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final RoadmapService roadmapService;
    private final ProgressEntryRepository progressEntryRepository;
    private final ProgressTaskEntryRepository progressTaskEntryRepository;
    private final PromptBuilder promptBuilder;
    private final AIClient aiClient;

    @Transactional(readOnly = true)
    public ChatResponse getDailyCoach(UUID goalId, String email) {

        Goal goal = getAuthorizedGoal(goalId, email);
        RoadmapResponse roadmap = roadmapService.getRoadmapByGoalId(goalId, email);
        ProgressEntry latestProgress = progressEntryRepository.findTopByGoalIdOrderByEntryDateDesc(goalId).orElse(null);
        List<ProgressTaskEntry> completedTasks = progressTaskEntryRepository.findAllByGoalIdOrderByCompletedAtDesc(goalId);
        List<Message> recentMessages = getRecentMessages(goalId, goal.getAccount().getId());

        String prompt = promptBuilder.buildDailyCoachPrompt(
                goal,
                roadmap,
                latestProgress,
                completedTasks,
                recentMessages,
                LocalDate.now()
        );

        String reply = aiClient.generate(prompt, String.class);

        return ChatResponse.builder()
                .reply(reply)
                .build();
    }

    private Goal getAuthorizedGoal(UUID goalId, String email) {

        Goal goal = goalRepository.findByIdAndDeletedFalse(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (!goal.getAccount().getEmail().equals(email)) {
            throw new ResourceNotFoundException("Goal not found");
        }

        return goal;
    }

    private List<Message> getRecentMessages(UUID goalId, UUID accountId) {

        Conversation conversation = conversationRepository
                .findTopByGoalIdAndAccountIdOrderByUpdatedAtDesc(goalId, accountId)
                .orElse(null);

        if (conversation == null) {
            return List.of();
        }

        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
    }
}
