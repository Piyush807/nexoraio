package io.nexora.backend.task.dto.request;

import io.nexora.backend.task.eums.TaskPriority;
import io.nexora.backend.task.eums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskRequest {
    private String  title;
    private String  description;
    private TaskPriority priority;
    private TaskStatus status;
    private LocalDate deadline;
}
