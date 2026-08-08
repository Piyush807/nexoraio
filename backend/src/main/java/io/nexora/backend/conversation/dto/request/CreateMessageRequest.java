package io.nexora.backend.conversation.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateMessageRequest {

    @NotBlank
    private String content;
}