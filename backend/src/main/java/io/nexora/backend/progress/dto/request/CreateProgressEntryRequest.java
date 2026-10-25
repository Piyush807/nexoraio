package io.nexora.backend.progress.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CreateProgressEntryRequest {
    @FutureOrPresent private LocalDate entryDate;
    @Size(max=2000) private String note;
    @Min(0) private Integer completedMilestones;
    @Min(0) private Integer completedTasks;
    @Min(0) @Max(10) private Integer growthScore;
}