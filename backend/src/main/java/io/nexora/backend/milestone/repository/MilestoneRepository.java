package io.nexora.backend.milestone.repository;

import io.nexora.backend.milestone.entity.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, UUID> {

    List<Milestone> findAllByRoadmapIdOrderByOrderIndex(UUID roadmapId);

}
