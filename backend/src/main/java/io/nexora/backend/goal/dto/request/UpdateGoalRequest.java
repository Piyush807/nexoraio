package io.nexora.backend.goal.dto.request;

import io.nexora.backend.goal.enums.CurrentLevel;
import io.nexora.backend.goal.enums.GoalStatus;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateGoalRequest {

    private String title;

    private String description;

    private CurrentLevel currentLevel;

    private GoalStatus status;

    private LocalDate targetDate;

    private Integer dailyStudyHours;
}