package io.nexora.backend.goal.dto.request;

import io.nexora.backend.goal.enums.CurrentLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateGoalRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private CurrentLevel currentLevel;

    @NotNull
    private LocalDate targetDate;

    @NotNull
    private Integer dailyStudyHours;
}