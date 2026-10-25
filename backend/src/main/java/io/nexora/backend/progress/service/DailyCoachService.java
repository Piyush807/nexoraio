package io.nexora.backend.progress.service;

import io.nexora.backend.ai.client.AIClient;
import io.nexora.backend.ai.dto.response.ChatResponse;
import io.nexora.backend.ai.prompt.PromptBuilder;
import io.nexora.backend.common.exception.ResourceNotFoundException;
import io.nexora.backend.goal.entity.Goal;
import io.nexora.backend.goal.repository.GoalRepository;
import io.nexora.backend.conversation.entity.Conversation;
import io.nexora.backend.conversation.entity.Message;
import io.nexora.backend.conversation.enums.MessageRole;
import io.nexora.backend.conversation.repository.ConversationRepository;
import io.nexora.backend.conversation.repository.MessageRepository;
import io.nexora.backend.progress.entity.ProgressEntry;
import io.nexora.backend.progress.entity.ProgressTaskEntry;
import io.nexora.backend.progress.entity.DailyCoachEntry;
import io.nexora.backend.progress.repository.ProgressEntryRepository;
import io.nexora.backend.progress.repository.ProgressTaskEntryRepository;
import io.nexora.backend.progress.repository.DailyCoachEntryRepository;
import io.nexora.backend.roadmap.entity.Roadmap;
import io.nexora.backend.roadmap.dto.response.RoadmapResponse;
import io.nexora.backend.roadmap.repository.RoadmapRepository;
import io.nexora.backend.roadmap.service.RoadmapService;
import io.nexora.backend.memory.dto.response.GrowthMemoryResponse;
import io.nexora.backend.memory.service.GrowthMemoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DailyCoachService {

    private final GoalRepository goalRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final RoadmapService roadmapService;
    private final RoadmapRepository roadmapRepository;
    private final ProgressEntryRepository progressEntryRepository;
    private final ProgressTaskEntryRepository progressTaskEntryRepository;
    private final DailyCoachEntryRepository dailyCoachEntryRepository;
    private final PromptBuilder promptBuilder;
    private final AIClient aiClient;
    private final GrowthMemoryService growthMemoryService;

    @Transactional
    public ChatResponse getDailyCoach(UUID goalId, String email) {

        Goal goal = getAuthorizedGoal(goalId, email);
        LocalDate today = LocalDate.now();

        DailyCoachEntry existingEntry = dailyCoachEntryRepository.findByGoalIdAndCoachDate(goalId, today)
                .orElse(null);

        if (existingEntry != null) {
            return ChatResponse.builder()
                    .reply(existingEntry.getReply())
                    .build();
        }

        Conversation conversation = getLatestConversation(goalId, goal.getAccount().getId());
        Roadmap roadmapEntity = roadmapRepository.findByGoalId(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap not found"));
        RoadmapResponse roadmap = roadmapService.getRoadmapByGoalId(goalId, email);
        ProgressEntry latestProgress = progressEntryRepository.findTopByGoalIdOrderByEntryDateDesc(goalId).orElse(null);
        List<ProgressTaskEntry> completedTasks = progressTaskEntryRepository.findAllByGoalIdOrderByCompletedAtDesc(goalId);
        List<Message> recentMessages = getRecentMessages(conversation);
        GrowthMemoryResponse memory = growthMemoryService.getOrRefresh(email);

        String prompt = promptBuilder.buildDailyCoachPrompt(
                goal,
                roadmap,
                latestProgress,
                completedTasks,
                recentMessages,
                today,
                memory
        );

        String reply = aiClient.generate(prompt, String.class);

        if (conversation != null && reply != null && !reply.isBlank()) {
            Message coachMessage = Message.builder()
                    .conversation(conversation)
                    .role(MessageRole.ASSISTANT)
                    .content(reply)
                    .build();

            messageRepository.save(coachMessage);
            conversation.setUpdatedAt(Instant.now());
            conversationRepository.save(conversation);
        }

        dailyCoachEntryRepository.save(
                DailyCoachEntry.builder()
                        .account(goal.getAccount())
                        .goal(goal)
                        .roadmap(roadmapEntity)
                        .conversation(conversation)
                        .coachDate(today)
                        .reply(reply)
                        .createdAt(Instant.now())
                        .build()
        );

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

    private Conversation getLatestConversation(UUID goalId, UUID accountId) {
        return conversationRepository
                .findTopByGoalIdAndAccountIdOrderByUpdatedAtDesc(goalId, accountId)
                .orElse(null);
    }

    private List<Message> getRecentMessages(Conversation conversation) {
        if (conversation == null) {
            return List.of();
        }

        return messageRepository.findTop40ByConversationIdOrderByCreatedAtDesc(conversation.getId()).stream().sorted(java.util.Comparator.comparing(Message::getCreatedAt)).toList();
    }
}
