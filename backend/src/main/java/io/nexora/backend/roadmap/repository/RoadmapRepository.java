package io.nexora.backend.roadmap.repository;

import io.nexora.backend.roadmap.entity.Roadmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface RoadmapRepository extends JpaRepository<Roadmap, UUID> {

    Optional<Roadmap> findByGoalId(UUID goalId);
    @Query("select distinct r from Roadmap r left join fetch r.milestones where r.goal.id in :goalIds")
    List<Roadmap> findAllByGoalIdIn(@Param("goalIds") Collection<UUID> goalIds);

}
