package io.nexora.backend.workspace.mapper;

import io.nexora.backend.workspace.dto.response.WorkspaceResponse;
import io.nexora.backend.workspace.entity.Workspace;
import org.springframework.stereotype.Component;

@Component
public class WorkspaceMapper {
    public WorkspaceResponse toResponse(Workspace workspace) {
        return new WorkspaceResponse(
                workspace.getId(),
                workspace.getName(),
                workspace.getDescription(),
                workspace.getOwner().getEmail(),
                workspace.getCreatedAt()
        );
    }

}
