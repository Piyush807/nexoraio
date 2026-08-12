package io.nexora.backend.roadmap.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapSkillResponse {

    private UUID id;
    private String name;
    private String description;
    private Integer progressPercentage;
    private boolean completed;
}
