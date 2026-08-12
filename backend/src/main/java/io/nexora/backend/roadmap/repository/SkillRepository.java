package io.nexora.backend.roadmap.repository;

import io.nexora.backend.roadmap.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SkillRepository extends JpaRepository<Skill, UUID> {

    List<Skill> findAllByRoadmapId(UUID roadmapId);
}
