package io.nexora.backend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoadmapGenerationResponse {

    private List<SkillDTO> skills;

    private List<MilestoneDTO> milestones;

}
