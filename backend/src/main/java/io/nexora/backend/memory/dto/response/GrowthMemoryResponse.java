package io.nexora.backend.memory.dto.response;

import lombok.Builder;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Builder
public record GrowthMemoryResponse(
        UUID id,
        String journeySummary,
        String currentFocus,
        String strengths,
        String frictionPoints,
        String patterns,
        LocalDate lastActivityDate,
        Instant lastConversationAt,
        Instant updatedAt
) {}
