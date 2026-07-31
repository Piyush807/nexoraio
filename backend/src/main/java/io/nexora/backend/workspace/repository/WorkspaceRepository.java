package io.nexora.backend.workspace.repository;

import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.workspace.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace , UUID> {
    List<Workspace> findAllByOwnerIdAndDeletedFalse(UUID ownerId);

   Optional<Workspace> findByIdAndOwnerIdAndDeletedFalse(UUID workspaceId, UUID ownerId);

}
