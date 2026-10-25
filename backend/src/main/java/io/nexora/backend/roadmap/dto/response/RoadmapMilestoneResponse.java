package io.nexora.backend.roadmap.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapMilestoneResponse {

    private UUID id;
    private String title;
    private String description;
    private Integer orderIndex;
    private Integer estimatedDays;
    private List<String> tasks;
    private boolean completed;
    private boolean manualOverride;
}
