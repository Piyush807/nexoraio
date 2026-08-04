package io.nexora.backend.ai.dto.response;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeminiContent {

    private List<GeminiPart> parts;

}