package io.nexora.backend.workspace.controller;

import io.nexora.backend.workspace.dto.request.CreateWorkspaceRequest;
import io.nexora.backend.workspace.dto.response.WorkspaceResponse;
import io.nexora.backend.workspace.entity.Workspace;
import io.nexora.backend.workspace.service.WorkspaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/workspaces")
public class WorkspaceController {
    private final WorkspaceService workspaceService;

    @PostMapping
    public WorkspaceResponse createWorkspace(@RequestBody CreateWorkspaceRequest request, Authentication authentication) {
        return workspaceService.createWorkspace(request, authentication.getName());

    }

    @GetMapping
    public List<WorkspaceResponse> getMyWorkspace( Authentication authentication) {
        return workspaceService.getMyWorkspaces(authentication.getName());

    }
}
