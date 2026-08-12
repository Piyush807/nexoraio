package io.nexora.backend.progress.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressEntryResponse {

    private UUID id;
    private UUID goalId;
    private UUID roadmapId;
    private LocalDate entryDate;
    private String note;
    private Integer completedMilestones;
    private Integer completedTasks;
    private Integer growthScore;
    private Instant createdAt;
    private Instant updatedAt;
}
