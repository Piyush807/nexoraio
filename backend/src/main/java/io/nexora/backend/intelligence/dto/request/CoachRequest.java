package io.nexora.backend.intelligence.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CoachRequest(
        @NotBlank
        @Pattern(regexp = "EXPLAIN|PLAN|UNSTUCK|REFLECT|RESTART", message = "Unsupported coaching mode")
        String mode
) {}
