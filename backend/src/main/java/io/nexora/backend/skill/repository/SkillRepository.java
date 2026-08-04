package io.nexora.backend.skill.repository;

import io.nexora.backend.skill.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
@Repository
public interface SkillRepository extends JpaRepository<Skill, UUID> {

    List<Skill> findAllByMilestoneId(UUID milestoneId);

}
