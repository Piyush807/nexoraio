package io.nexora.backend.project.dto.response;

import io.nexora.backend.project.enums.ProjectStatus;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Data
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class ProjectResponse {
    private UUID id;
    private String name;
    private String description;
    private ProjectStatus status;
    private UUID workspaceId;
    private Instant createdAt;
    private Instant updatedAt;
}
