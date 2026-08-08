package io.nexora.backend.conversation.dto.response;

import io.nexora.backend.conversation.enums.MessageRole;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {

    private UUID id;
    private MessageRole role;
    private String content;
    private LocalDateTime createdAt;
}