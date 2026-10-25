package io.nexora.backend.intelligence.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyIntelligenceResponse {
    private LocalDate date;
    private UUID focusGoalId;
    private String focusGoalTitle;
    private String headline;
    private String reason;
    private String nextAction;
    private String milestoneTitle;
    private int completedTasks;
    private int totalTasks;
    private int progressPercent;
    private long inactiveDays;
    private boolean needsRestart;
    private boolean roadmapAvailable;
}
