package io.nexora.backend.workspace.service;

import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.auth.repository.AccountRepository;
import io.nexora.backend.common.exception.ResourceNotFoundException;
import io.nexora.backend.workspace.dto.request.CreateWorkspaceRequest;
import io.nexora.backend.workspace.dto.response.WorkspaceResponse;
import io.nexora.backend.workspace.entity.Workspace;
import io.nexora.backend.workspace.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkspaceService {
    private final WorkspaceRepository workspaceRepository;
    private final AccountRepository accountRepository;

    public WorkspaceResponse createWorkspace(CreateWorkspaceRequest request, String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Account not found"));

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
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        List<Workspace> workspaces = workspaceRepository.findAllByOwnerIdAndDeletedFalse(account.getId());

        return workspaces.stream()
                .map(workspace -> new WorkspaceResponse(workspace.getId(),
                        workspace.getName(),
                        workspace.getDescription(),
                        workspace.getOwner().getEmail(),
                        workspace.getCreatedAt()))
                .toList();
    }

}
