package io.nexora.backend.goal.dto.response;

import io.nexora.backend.goal.enums.CurrentLevel;
import io.nexora.backend.goal.enums.GoalStatus;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalResponse {

    private UUID id;

    private String title;

    private String description;

    private CurrentLevel currentLevel;

    private GoalStatus status;

    private LocalDate targetDate;

    private Integer dailyStudyHours;

    private Instant createdAt;

    private Instant updatedAt;
}