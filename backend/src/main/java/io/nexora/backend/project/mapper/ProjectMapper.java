package io.nexora.backend.project.mapper;

import io.nexora.backend.project.dto.response.ProjectResponse;
import io.nexora.backend.project.entity.Project;

public class ProjectMapper {

    public ProjectResponse toResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getStatus(),
                project.getWorkspace().getId(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}
