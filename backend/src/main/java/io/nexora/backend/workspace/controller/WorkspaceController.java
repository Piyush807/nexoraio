package io.nexora.backend.workspace.controller;

import io.nexora.backend.workspace.dto.request.CreateWorkspaceRequest;
import io.nexora.backend.workspace.dto.request.UpdateWorkspaceRequest;
import io.nexora.backend.workspace.dto.response.WorkspaceResponse;
import io.nexora.backend.workspace.entity.Workspace;
import io.nexora.backend.workspace.service.WorkspaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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

    @GetMapping("/{workspaceId}")
    public WorkspaceResponse getWorkspace(@PathVariable("workspaceId") UUID workspaceId, Authentication authentication) {
        return workspaceService.getWorkspace(workspaceId, authentication.getName());
    }

    @PutMapping("/{workspaceId}")
    public WorkspaceResponse updateWorkspace(@PathVariable("workspaceId") UUID workspaceId, @Valid @RequestBody UpdateWorkspaceRequest request, Authentication authentication) {
        return workspaceService.updateWorkspace(workspaceId, request, authentication.getName());
    }

    @DeleteMapping("{/workspaceId}")
    public ResponseEntity<String> deleteWorkspace(@PathVariable("workspaceId") UUID workspaceId, Authentication authentication) {
         workspaceService.deleteWorkspace(workspaceId, authentication.getName());
         return ResponseEntity.ok("Workspace deleted");
    }
}
