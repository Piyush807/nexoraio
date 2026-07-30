package io.nexora.backend.workspace.repository;

import io.nexora.backend.workspace.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
@Repository
public interface WorkspaceRepository extends JpaRepository<Workspace , UUID> {

}
