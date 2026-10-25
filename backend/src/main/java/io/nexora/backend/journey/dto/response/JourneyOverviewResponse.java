package io.nexora.backend.journey.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JourneyOverviewResponse {
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private String headline;
    private String summary;
    private int thisWeekActiveDays;
    private int thisWeekCompletedTasks;
    private int thisWeekProgressEntries;
    private int previousWeekActiveDays;
    private int previousWeekCompletedTasks;
    private int previousWeekProgressEntries;
    private List<GoalSnapshot> goals;
    private List<TimelineItem> timeline;
    private List<String> reflectionPrompts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoalSnapshot {
        private UUID goalId;
        private String title;
        private int progressPercent;
        private int completedTasks;
        private int totalTasks;
        private LocalDate lastActivityDate;
        private String signal;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelineItem {
        private LocalDate date;
        private String type;
        private String title;
        private String detail;
        private UUID goalId;
    }
}
