package io.nexora.backend.progress.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProgressEntryRequest {

    private LocalDate entryDate;
    private String note;
    private Integer completedMilestones;
    private Integer completedTasks;
    private Integer growthScore;
}
