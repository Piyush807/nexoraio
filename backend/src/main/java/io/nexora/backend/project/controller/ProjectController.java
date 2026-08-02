package io.nexora.backend.project.controller;

import io.nexora.backend.project.dto.request.CreateProjectRequest;
import io.nexora.backend.project.dto.request.UpdateProjectRequest;
import io.nexora.backend.project.dto.response.ProjectResponse;
import io.nexora.backend.project.service.ProjectService;
import jakarta.validation.Valid;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/projects")
public class ProjectController {
    private final ProjectService projectService;
    @PostMapping
    public ProjectResponse createProject (@PathVariable("workspaceId") UUID workspaceId, @Valid @RequestBody CreateProjectRequest createProjectRequest, Authentication authentication) {
        return projectService.createProject(workspaceId, createProjectRequest, authentication.getName());
    }

    @GetMapping
    public List<ProjectResponse> getMyProjects(@PathVariable("workspaceId") UUID workspaceId,Authentication authentication) {
        return projectService.getProjects(workspaceId, authentication.getName());
    }

    @GetMapping("/{projectId}")
    public ProjectResponse getProjectById ( @PathVariable("projectId") UUID projectId, Authentication authentication) {
        return projectService.getProjectById(projectId, authentication.getName());
    }

    @PutMapping("/{projectId}")
    public ProjectResponse updateProject (@PathVariable("projectId") UUID projectId, @Valid @RequestBody UpdateProjectRequest updateProjectRequest, Authentication authentication) {
        return projectService.updateProject(projectId, updateProjectRequest, authentication.getName());
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject (@PathVariable("projectId") UUID projectId, Authentication authentication) {
        return projectService.deleteProject(projectId, authentication.getName());
    }




}
