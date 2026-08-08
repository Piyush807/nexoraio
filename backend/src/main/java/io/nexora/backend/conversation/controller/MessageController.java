package io.nexora.backend.conversation.controller;

import io.nexora.backend.common.security.CustomUserDetails;
import io.nexora.backend.conversation.dto.request.CreateMessageRequest;
import io.nexora.backend.conversation.dto.response.MessageResponse;
import io.nexora.backend.conversation.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/conversations/{conversationId}/messages")
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    public ResponseEntity<MessageResponse> createMessage(@PathVariable UUID conversationId, @Valid @RequestBody CreateMessageRequest request, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        UUID accountId = userDetails.getAccount().getId();
        return ResponseEntity.ok(messageService.createMessage(conversationId, accountId, request));
    }

    @GetMapping
    public ResponseEntity<List<MessageResponse>> getMessages(@PathVariable UUID conversationId, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        UUID accountId = userDetails.getAccount().getId();

        return ResponseEntity.ok(messageService.getMessages(conversationId, accountId));
    }
}