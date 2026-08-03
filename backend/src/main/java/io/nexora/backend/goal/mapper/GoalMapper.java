package io.nexora.backend.goal.mapper;

import io.nexora.backend.goal.dto.response.GoalResponse;
import io.nexora.backend.goal.entity.Goal;
import org.springframework.stereotype.Component;

@Component
public class GoalMapper {

    public GoalResponse toResponse(Goal goal) {

        return GoalResponse.builder()
                .id(goal.getId())
                .title(goal.getTitle())
                .description(goal.getDescription())
                .currentLevel(goal.getCurrentLevel())
                .status(goal.getStatus())
                .targetDate(goal.getTargetDate())
                .dailyStudyHours(goal.getDailyStudyHours())
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .build();
    }
}