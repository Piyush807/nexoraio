package io.nexora.backend.progress.repository;

import io.nexora.backend.progress.entity.DailyCoachEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailyCoachEntryRepository extends JpaRepository<DailyCoachEntry, UUID> {

    Optional<DailyCoachEntry> findByGoalIdAndCoachDate(UUID goalId, LocalDate coachDate);
}
