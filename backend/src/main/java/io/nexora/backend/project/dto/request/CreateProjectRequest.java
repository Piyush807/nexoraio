package io.nexora.backend.project.dto.request;

import io.nexora.backend.task.eums.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateProjectRequest {
    @NotBlank
    private String  name;
    private String  description;

}
