package io.nexora.backend.task.dto.response;

import io.nexora.backend.task.eums.TaskPriority;
import io.nexora.backend.task.eums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class TaskResponse {
    private UUID id;
    private String title;
    private String description;
    private LocalDate deadline;
    private TaskStatus status;
    private Instant createdAt;
    private Instant updatedAt;
    private TaskPriority priority;
    private UUID projectId;
}
