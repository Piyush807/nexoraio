package io.nexora.backend.progress.repository;

import io.nexora.backend.progress.entity.ProgressEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProgressEntryRepository extends JpaRepository<ProgressEntry, UUID> {

    List<ProgressEntry> findAllByGoalIdOrderByEntryDateDesc(UUID goalId);

    @Query("select p from ProgressEntry p join p.goal g where p.account.id = :accountId and g.deleted = false order by p.entryDate desc")
    List<ProgressEntry> findAllByActiveGoalAccountIdOrderByEntryDateDesc(@Param("accountId") UUID accountId);

    Optional<ProgressEntry> findTopByGoalIdOrderByEntryDateDesc(UUID goalId);

    // Distinct dates (across every goal) the account logged at least one
    // progress entry on — the raw material for a streak calculation. A
    // day counts once no matter how many goals or entries it had.
    @Query("select distinct p.entryDate from ProgressEntry p join p.goal g where p.account.id = :accountId and g.deleted = false order by p.entryDate desc")
    List<LocalDate> findDistinctEntryDatesByAccountId(@Param("accountId") UUID accountId);
}
