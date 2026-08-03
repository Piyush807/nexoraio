package io.nexora.backend.goal.repository;

import io.nexora.backend.goal.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GoalRepository extends JpaRepository<Goal, UUID> {

    List<Goal> findAllByAccountIdAndDeletedFalse(UUID accountId);

    Optional<Goal> findByIdAndDeletedFalse(UUID id);
}