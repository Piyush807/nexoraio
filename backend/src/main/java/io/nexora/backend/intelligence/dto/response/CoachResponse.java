package io.nexora.backend.intelligence.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoachResponse {
    private String mode;
    private String title;
    private String response;
    private String microAction;
    private String whyNow;
}
