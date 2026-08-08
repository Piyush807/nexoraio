package io.nexora.backend.conversation.controller;

import io.nexora.backend.common.security.CustomUserDetails;
import io.nexora.backend.conversation.dto.request.CreateConversationRequest;
import io.nexora.backend.conversation.dto.response.ConversationResponse;
import io.nexora.backend.conversation.service.ConversationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/conversations")
public class ConversationController {
    private final ConversationService conversationService;

    @PostMapping
    public ResponseEntity<ConversationResponse> createConversation(@Valid @RequestBody CreateConversationRequest request, Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        UUID accountId = userDetails.getAccount().getId();

        return ResponseEntity.ok(conversationService.createConversation(accountId, request));
    }

    @GetMapping
    public ResponseEntity<List<ConversationResponse>> getAllConversations(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UUID accountId = userDetails.getAccount().getId();

        return ResponseEntity.ok(conversationService.getUserConversations(accountId));
    }

    @GetMapping("/{conversationId}")
    public ResponseEntity<ConversationResponse> getConversation(@PathVariable UUID conversationId, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UUID accountId = userDetails.getAccount().getId();

        return ResponseEntity.ok(conversationService.getConversation(conversationId, accountId));
    }

    @DeleteMapping("/{conversationId}")
    public ResponseEntity<Void> deleteConversation(@PathVariable UUID conversationId, Authentication authentication) {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        UUID accountId = userDetails.getAccount().getId();

        conversationService.deleteConversation(conversationId, accountId);

        return ResponseEntity.noContent().build();
    }


}
