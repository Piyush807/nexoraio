package io.nexora.backend.goal.dto.request;

import io.nexora.backend.goal.enums.CurrentLevel;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CreateGoalRequest {
    @NotBlank @Size(max=160) private String title;
    @Size(max=2000) private String description;
    @NotNull private CurrentLevel currentLevel;
    @NotNull @FutureOrPresent private LocalDate targetDate;
    @NotNull @Min(1) @Max(24) private Integer dailyStudyHours;
}