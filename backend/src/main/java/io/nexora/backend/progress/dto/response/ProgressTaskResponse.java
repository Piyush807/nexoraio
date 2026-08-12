package io.nexora.backend.progress.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressTaskResponse {

    private UUID id;
    private UUID goalId;
    private UUID roadmapId;
    private String milestoneTitle;
    private String taskTitle;
    private boolean completed;
    private LocalDateTime completedAt;
    private Instant createdAt;
    private Instant updatedAt;
}
