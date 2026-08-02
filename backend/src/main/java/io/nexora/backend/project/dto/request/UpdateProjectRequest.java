package io.nexora.backend.project.dto.request;

import io.nexora.backend.project.enums.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class UpdateProjectRequest {
    @NotBlank
    private String name;

    private String description;
    private ProjectStatus status;
}
