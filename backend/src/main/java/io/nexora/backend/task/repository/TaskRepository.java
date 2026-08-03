package io.nexora.backend.task.repository;

import io.nexora.backend.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findAllByProjectIdAndDeletedFalse(UUID projectId);

    Optional<Task> findByIdAndDeletedFalse(UUID taskId);
}
