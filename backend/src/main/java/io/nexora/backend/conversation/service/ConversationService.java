package io.nexora.backend.conversation.service;

import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.common.exception.ResourceNotFoundException;
import io.nexora.backend.conversation.dto.request.CreateConversationRequest;
import io.nexora.backend.conversation.dto.response.ConversationResponse;
import io.nexora.backend.conversation.entity.Conversation;
import io.nexora.backend.conversation.repository.ConversationRepository;
import io.nexora.backend.goal.entity.Goal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
@Service
@RequiredArgsConstructor
public class ConversationService {
    private final ConversationRepository conversationRepository;

    private ConversationResponse toResponse(Conversation conversation) {
        return ConversationResponse.builder()
                .id(conversation.getId())
                .goalId(conversation.getGoal() != null
                        ? conversation.getGoal().getId()
                        : null)
                .title(conversation.getTitle())
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .build();
    }

   public ConversationResponse createConversation(UUID accountId, CreateConversationRequest request) {
       Account account = new Account();
       account.setId(accountId);
       Conversation conversation = Conversation.builder()
               .account(account)
               .title(request.getTitle() != null && !request.getTitle().isBlank()
                       ? request.getTitle()
                       : "New Conversation")
               .createdAt(Instant.now())
               .updatedAt(Instant.now())
               .build();

       if (request.getGoalId() != null) {
           Goal goal = new Goal();
           goal.setId(request.getGoalId());
           conversation.setGoal(goal);
       }

       Conversation savedConversation = conversationRepository.save(conversation);
       return toResponse(savedConversation);
    }



    public List<ConversationResponse> getUserConversations(UUID accountId) {

       List <Conversation> conversations =conversationRepository.findByAccountId(accountId);
        return conversations.stream().
                map(this::toResponse).toList();
    }

    public ConversationResponse getConversation(UUID conversationId, UUID accountId) {

       Conversation conversation = conversationRepository.findByIdAndAccountId(conversationId, accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
       return toResponse(conversation);
    }

    public void deleteConversation(UUID conversationId, UUID accountId) {

        Conversation conversation = conversationRepository
                .findByIdAndAccountId(conversationId, accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        conversationRepository.delete(conversation);
    }
}
