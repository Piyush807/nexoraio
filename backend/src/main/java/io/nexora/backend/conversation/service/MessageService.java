package io.nexora.backend.conversation.service;

import io.nexora.backend.ai.dto.response.ChatResponse;
import io.nexora.backend.ai.service.AIService;
import io.nexora.backend.common.exception.ResourceNotFoundException;
import io.nexora.backend.conversation.dto.request.CreateMessageRequest;
import io.nexora.backend.conversation.dto.response.MessageResponse;
import io.nexora.backend.conversation.entity.Conversation;
import io.nexora.backend.conversation.entity.Message;
import io.nexora.backend.conversation.enums.MessageRole;
import io.nexora.backend.conversation.repository.ConversationRepository;
import io.nexora.backend.conversation.repository.MessageRepository;
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



    public MessageResponse createMessage(UUID conversationId, UUID accountId, CreateMessageRequest request) {
        Conversation conversation = conversationRepository
                .findByIdAndAccountId(conversationId, accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        Message message = Message.builder()
                .conversation(conversation)
                .role(MessageRole.USER)
                .content(request.getContent())
                .build();

        Message savedMessage = messageRepository.save(message);

        return mapToResponse(savedMessage);
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