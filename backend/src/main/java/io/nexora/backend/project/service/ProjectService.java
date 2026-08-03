package io.nexora.backend.project.service;

import io.nexora.backend.common.exception.ResourceNotFoundException;
import io.nexora.backend.project.dto.request.CreateProjectRequest;
import io.nexora.backend.project.dto.request.UpdateProjectRequest;
import io.nexora.backend.project.dto.response.ProjectResponse;
import io.nexora.backend.project.entity.Project;
import io.nexora.backend.project.enums.ProjectStatus;
import io.nexora.backend.project.mapper.ProjectMapper;
import io.nexora.backend.project.repository.ProjectRepository;
import io.nexora.backend.workspace.dto.request.CreateWorkspaceRequest;
import io.nexora.backend.workspace.entity.Workspace;
import io.nexora.backend.workspace.service.WorkspaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
@RequiredArgsConstructor
@Service
public class ProjectService {
    private final ProjectRepository projectRepository;
    private final WorkspaceService workspaceService;
    private final ProjectMapper  projectMapper;

    public Project getAuthorizedProject(UUID projectId, String email) {
        Project project = projectRepository.findByIdAndDeletedFalse(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));


        workspaceService.getAuthorizedWorkspace(project.getWorkspace().getId(), email);
        return project;
    }



    public ProjectResponse createProject(UUID workspaceId, CreateProjectRequest request, String email) {
        Workspace workspace = workspaceService.getAuthorizedWorkspace(workspaceId, email);

        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setWorkspace(workspace);
        project.setStatus(ProjectStatus.ACTIVE);
        project.setCreatedAt(Instant.now());
        project.setUpdatedAt(Instant.now());
        Project savedProject =  projectRepository.save(project);

        return projectMapper.toResponse(savedProject);
    }

    public List<ProjectResponse> getProjects(UUID workspaceId, String email) {
         workspaceService.getAuthorizedWorkspace(workspaceId, email);

        List<Project> projects= projectRepository.findAllByWorkspaceIdAndDeletedFalse(workspaceId);

         return projects.stream()
                 .map(project -> projectMapper.toResponse(project)).toList();

    }

    public ProjectResponse getProjectById(UUID projectId, String email) {
        Project project = getAuthorizedProject(projectId, email);
        return  projectMapper.toResponse(project);

    }

    public ProjectResponse updateProject(UUID projectId, UpdateProjectRequest request, String email) {
        Project project = getAuthorizedProject(projectId, email);
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStatus(request.getStatus());
        project.setUpdatedAt(Instant.now());
       Project savedProject = projectRepository.save(project);

       return  projectMapper.toResponse(savedProject);


    }

    public ResponseEntity<Void> deleteProject(UUID projectId, String email) {
        Project project = getAuthorizedProject(projectId, email);
        project.setDeleted(true);
        project.setUpdatedAt(Instant.now());
        projectRepository.save(project);
        return ResponseEntity.ok().build();
    }

}
