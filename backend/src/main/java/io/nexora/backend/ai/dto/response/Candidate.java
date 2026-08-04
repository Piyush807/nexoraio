package io.nexora.backend.ai.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Candidate {

    private GeminiContent content;

}