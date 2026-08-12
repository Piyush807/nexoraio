package io.nexora.backend.roadmap.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapResponse {

    private UUID id;
    private UUID goalId;
    private String title;
    private String description;
    private Instant generatedAt;
    private boolean active;
    private List<RoadmapSkillResponse> skills;
    private List<RoadmapMilestoneResponse> milestones;
}
