package io.nexora.backend.task.dto.request;

import io.nexora.backend.task.eums.TaskPriority;
import io.nexora.backend.task.eums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;



@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CreateTaskRequest {
    @NotBlank
    private String title;
    private String description;
    private TaskPriority priority;
    private LocalDate deadline;
}
