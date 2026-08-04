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
public class MilestoneDTO {

    private String title;

    private String description;

    private Integer estimatedDays;

    private List<String> tasks;

}
