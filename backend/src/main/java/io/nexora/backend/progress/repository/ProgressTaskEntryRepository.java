package io.nexora.backend.progress.repository;

import io.nexora.backend.progress.entity.ProgressTaskEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProgressTaskEntryRepository extends JpaRepository<ProgressTaskEntry, UUID> {

    List<ProgressTaskEntry> findAllByGoalIdOrderByCompletedAtDesc(UUID goalId);

    @Query("select t from ProgressTaskEntry t join t.goal g where t.account.id = :accountId and g.deleted = false and t.completed = true order by t.completedAt desc")
    List<ProgressTaskEntry> findAllByActiveGoalAccountIdAndCompletedTrueOrderByCompletedAtDesc(UUID accountId);

    Optional<ProgressTaskEntry> findByGoalIdAndMilestoneTitleAndTaskTitle(UUID goalId, String milestoneTitle, String taskTitle);

    long countByGoalIdAndCompletedTrue(UUID goalId);

    long countByGoalIdAndMilestoneTitleAndCompletedTrue(UUID goalId, String milestoneTitle);
}
