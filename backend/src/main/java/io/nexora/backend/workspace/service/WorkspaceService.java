package io.nexora.backend.workspace.service;

import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.auth.repository.AccountRepository;
import io.nexora.backend.common.exception.ResourceNotFoundException;
import io.nexora.backend.workspace.dto.request.CreateWorkspaceRequest;
import io.nexora.backend.workspace.dto.request.UpdateWorkspaceRequest;
import io.nexora.backend.workspace.dto.response.WorkspaceResponse;
import io.nexora.backend.workspace.entity.Workspace;
import io.nexora.backend.workspace.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkspaceService {
    private final WorkspaceRepository workspaceRepository;
    private final AccountRepository accountRepository;

    private Account getAccountByEmail(String email) {
        return accountRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account with email " + email + " not found"));
    }

    private Workspace getAuthorizedWorkspace(UUID workspaceId, String email) {
        Account account = getAccountByEmail(email);
        Optional<Workspace> workspaceOptional = workspaceRepository.findByIdAndOwnerIdAndDeletedFalse(workspaceId , account.getId());
        Workspace workspace = workspaceOptional.orElseThrow(
                () -> new ResourceNotFoundException("Workspace not found"));

        return workspace;

    }

    public WorkspaceResponse createWorkspace(CreateWorkspaceRequest request, String email) {
        Account account = getAccountByEmail(email);

        Workspace workspace = new Workspace();

        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());
        workspace.setOwner(account);

        Workspace savedWorkspace = workspaceRepository.save(workspace);

        return new WorkspaceResponse(
                savedWorkspace.getId(),
                savedWorkspace.getName(),
                savedWorkspace.getDescription(),
                savedWorkspace.getOwner().getEmail(),
                savedWorkspace.getCreatedAt()
        );

    }

    public List<WorkspaceResponse> getMyWorkspaces(String email){
        Account account = getAccountByEmail(email);

        List<Workspace> workspaces = workspaceRepository.findAllByOwnerIdAndDeletedFalse(account.getId());

        return workspaces.stream()
                .map(workspace -> new WorkspaceResponse(workspace.getId(),
                        workspace.getName(),
                        workspace.getDescription(),
                        workspace.getOwner().getEmail(),
                        workspace.getCreatedAt()))
                .toList();
    }

    public WorkspaceResponse getWorkspace(UUID workspaceId, String email){

        Workspace workspace = getAuthorizedWorkspace(workspaceId, email);

        return new WorkspaceResponse(
                workspace.getId(),
                workspace.getName(),
                workspace.getDescription(),
                workspace.getOwner().getEmail(),
                workspace.getCreatedAt());
    }

    public WorkspaceResponse updateWorkspace(UUID workspaceId, UpdateWorkspaceRequest request, String email){

        Workspace workspace = getAuthorizedWorkspace(workspaceId, email);
        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());
        Workspace updatedWorkspaces = workspaceRepository.save(workspace);
        return new WorkspaceResponse(updatedWorkspaces.getId(), updatedWorkspaces.getName(), updatedWorkspaces.getDescription(),  updatedWorkspaces.getOwner().getEmail(), updatedWorkspaces.getCreatedAt());

    }

    public void deleteWorkspace(UUID workspaceId, String name) {
        Workspace workspace = getAuthorizedWorkspace(workspaceId, name);
        workspace.setDeleted(true);
        workspaceRepository.save(workspace);

    }
}
