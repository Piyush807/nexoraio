package io.nexora.backend.conversation.service;

import io.nexora.backend.common.exception.ResourceNotFoundException;
import io.nexora.backend.ai.dto.response.ChatResponse;
import io.nexora.backend.ai.service.AIService;
import io.nexora.backend.conversation.dto.request.CreateMessageRequest;
import io.nexora.backend.conversation.dto.response.MessageResponse;
import io.nexora.backend.conversation.entity.Conversation;
import io.nexora.backend.conversation.entity.Message;
import io.nexora.backend.conversation.enums.MessageRole;
import io.nexora.backend.conversation.repository.ConversationRepository;
import io.nexora.backend.conversation.repository.MessageRepository;
import io.nexora.backend.goal.entity.Goal;
import io.nexora.backend.goal.enums.GoalStatus;
import io.nexora.backend.goal.repository.GoalRepository;
import io.nexora.backend.roadmap.dto.response.RoadmapResponse;
import io.nexora.backend.roadmap.service.RoadmapService;
import io.nexora.backend.memory.dto.response.GrowthMemoryResponse;
import io.nexora.backend.memory.service.GrowthMemoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final AIService aiService;
    private final RoadmapService roadmapService;
    private final GoalRepository goalRepository;
    private final GrowthMemoryService growthMemoryService;

    public MessageResponse createMessage(UUID conversationId, UUID accountId, CreateMessageRequest request) {
        Conversation conversation = conversationRepository
                .findByIdAndAccountId(conversationId, accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        Message userMessage = Message.builder()
                .conversation(conversation)
                .role(MessageRole.USER)
                .content(request.getContent())
                .build();

        List<Message> messages = new java.util.ArrayList<>(
                messageRepository.findTop40ByConversationIdOrderByCreatedAtDesc(conversationId)
                        .stream()
                        .sorted(java.util.Comparator.comparing(Message::getCreatedAt))
                        .toList()
        );
        messages.add(userMessage);

        Goal goal = conversation.getGoal();
        GrowthMemoryResponse memory = growthMemoryService.getOrRefresh(
                conversation.getAccount().getEmail()
        );
        ChatResponse aiResponse;

        if (goal != null) {
            RoadmapResponse roadmap = roadmapService.getRoadmapByGoalIdOrNull(goal.getId());
            aiResponse = aiService.chat(messages, goal, roadmap, memory);
        } else {
            // Not linked to a goal: give the assistant visibility into every
            // active goal instead of nothing, so a general conversation can
            // still give goal-aware answers (see AIService.chat(messages, goals)).
            List<Goal> activeGoals = goalRepository.findAllByAccountIdAndDeletedFalse(accountId).stream()
                    .filter(g -> g.getStatus() == GoalStatus.ACTIVE)
                    .toList();
            aiResponse = aiService.chat(messages, activeGoals, memory);
        }

        Message assistantMessage = Message.builder()
                .conversation(conversation)
                .role(MessageRole.ASSISTANT)
                .content(aiResponse.getReply())
                .build();

        // Persist both messages only after the AI call succeeds. A provider
        // failure therefore cannot leave a user message in the database with
        // no assistant response.
        messageRepository.save(userMessage);
        Message savedAssistantMessage = messageRepository.save(assistantMessage);
        conversation.setUpdatedAt(java.time.Instant.now());
        conversationRepository.save(conversation);
        growthMemoryService.touchConversation(conversation.getAccount().getEmail());

        return mapToResponse(savedAssistantMessage);
    }

    public List<MessageResponse> getMessages(UUID conversationId, UUID accountId) {

        conversationRepository
                .findByIdAndAccountId(conversationId, accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        return messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private MessageResponse mapToResponse(Message message) {

        return MessageResponse.builder()
                .id(message.getId())
                .role(message.getRole())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
