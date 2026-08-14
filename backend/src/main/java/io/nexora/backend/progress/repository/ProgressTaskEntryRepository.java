package io.nexora.backend.progress.repository;

import io.nexora.backend.progress.entity.ProgressTaskEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProgressTaskEntryRepository extends JpaRepository<ProgressTaskEntry, UUID> {

    List<ProgressTaskEntry> findAllByGoalIdOrderByCompletedAtDesc(UUID goalId);

    Optional<ProgressTaskEntry> findByGoalIdAndMilestoneTitleAndTaskTitle(UUID goalId, String milestoneTitle, String taskTitle);

    long countByGoalIdAndCompletedTrue(UUID goalId);
}
