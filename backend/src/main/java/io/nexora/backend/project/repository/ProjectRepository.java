package io.nexora.backend.project.repository;

import io.nexora.backend.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    List<Project> findAllByWorkspaceIdAndDeletedFalse(UUID workspaceId);

    Optional<Project> findByIdAndWorkspaceIdAndDeletedFalse(UUID projectId,UUID workspaceId);

    Optional<Project> findByIdAndDeletedFalse(UUID projectId);
}
