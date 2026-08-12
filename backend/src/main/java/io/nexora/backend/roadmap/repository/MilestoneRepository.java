package io.nexora.backend.roadmap.repository;

import io.nexora.backend.roadmap.entity.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, UUID> {

    List<Milestone> findAllByRoadmapIdOrderByOrderIndex(UUID roadmapId);
}
