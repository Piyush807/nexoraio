package io.nexora.backend.journey.service;

import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.auth.repository.AccountRepository;
import io.nexora.backend.common.exception.ResourceNotFoundException;
import io.nexora.backend.goal.entity.Goal;
import io.nexora.backend.goal.enums.GoalStatus;
import io.nexora.backend.goal.repository.GoalRepository;
import io.nexora.backend.journey.dto.response.JourneyOverviewResponse;
import io.nexora.backend.progress.entity.ProgressEntry;
import io.nexora.backend.progress.entity.ProgressTaskEntry;
import io.nexora.backend.progress.repository.ProgressEntryRepository;
import io.nexora.backend.progress.repository.ProgressTaskEntryRepository;
import io.nexora.backend.roadmap.dto.response.RoadmapResponse;
import io.nexora.backend.roadmap.service.RoadmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import io.nexora.backend.roadmap.entity.Roadmap;

@Service
@RequiredArgsConstructor
public class JourneyService {
    private final AccountRepository accountRepository;
    private final GoalRepository goalRepository;
    private final ProgressEntryRepository progressEntryRepository;
    private final ProgressTaskEntryRepository progressTaskEntryRepository;
    private final RoadmapService roadmapService;

    @Transactional(readOnly = true)
    public JourneyOverviewResponse getOverview(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);
        LocalDate previousStart = today.minusDays(13);
        LocalDate previousEnd = today.minusDays(7);

        List<ProgressEntry> progress = progressEntryRepository.findAllByActiveGoalAccountIdOrderByEntryDateDesc(account.getId());
        List<ProgressTaskEntry> tasks = progressTaskEntryRepository.findAllByActiveGoalAccountIdAndCompletedTrueOrderByCompletedAtDesc(account.getId());
        List<Goal> activeGoals = goalRepository.findAllByAccountIdAndDeletedFalse(account.getId()).stream()
                .filter(g -> g.getStatus() == GoalStatus.ACTIVE)
                .toList();

        Set<LocalDate> thisWeekDates = new TreeSet<>();
        progress.stream().map(ProgressEntry::getEntryDate).filter(Objects::nonNull)
                .filter(d -> !d.isBefore(weekStart) && !d.isAfter(today)).forEach(thisWeekDates::add);
        tasks.stream().map(t -> t.getCompletedAt() == null ? null : t.getCompletedAt().toLocalDate()).filter(Objects::nonNull)
                .filter(d -> !d.isBefore(weekStart) && !d.isAfter(today)).forEach(thisWeekDates::add);
        Set<LocalDate> previousWeekDates = new TreeSet<>();
        progress.stream().map(ProgressEntry::getEntryDate).filter(Objects::nonNull)
                .filter(d -> !d.isBefore(previousStart) && !d.isAfter(previousEnd)).forEach(previousWeekDates::add);
        tasks.stream().map(t -> t.getCompletedAt() == null ? null : t.getCompletedAt().toLocalDate()).filter(Objects::nonNull)
                .filter(d -> !d.isBefore(previousStart) && !d.isAfter(previousEnd)).forEach(previousWeekDates::add);

        int thisTasks = (int) tasks.stream().filter(t -> within(t.getCompletedAt() == null ? null : t.getCompletedAt().toLocalDate(), weekStart, today)).count();
        int previousTasks = (int) tasks.stream().filter(t -> within(t.getCompletedAt() == null ? null : t.getCompletedAt().toLocalDate(), previousStart, previousEnd)).count();
        int thisEntries = (int) progress.stream().filter(p -> within(p.getEntryDate(), weekStart, today)).count();
        int previousEntries = (int) progress.stream().filter(p -> within(p.getEntryDate(), previousStart, previousEnd)).count();

        Map<UUID, Roadmap> roadmaps = roadmapService.findRoadmapsByGoalIds(activeGoals.stream().map(Goal::getId).toList());
        List<JourneyOverviewResponse.GoalSnapshot> snapshots = activeGoals.stream().map(g -> snapshot(g, tasks, progress, roadmaps.get(g.getId()))).toList();
        List<JourneyOverviewResponse.TimelineItem> timeline = buildTimeline(progress, tasks, weekStart, today);
        String headline = buildHeadline(thisWeekDates.size(), thisTasks, previousWeekDates.size(), previousTasks, activeGoals.size());
        String summary = buildSummary(thisWeekDates.size(), thisTasks, thisEntries, previousWeekDates.size(), previousTasks);
        List<String> prompts = buildPrompts(thisWeekDates.size(), thisTasks, previousWeekDates.size(), previousTasks, snapshots);

        return JourneyOverviewResponse.builder()
                .periodStart(weekStart).periodEnd(today)
                .headline(headline).summary(summary)
                .thisWeekActiveDays(thisWeekDates.size()).thisWeekCompletedTasks(thisTasks).thisWeekProgressEntries(thisEntries)
                .previousWeekActiveDays(previousWeekDates.size()).previousWeekCompletedTasks(previousTasks).previousWeekProgressEntries(previousEntries)
                .goals(snapshots).timeline(timeline).reflectionPrompts(prompts)
                .build();
    }

    private JourneyOverviewResponse.GoalSnapshot snapshot(Goal goal, List<ProgressTaskEntry> tasks, List<ProgressEntry> progress, Roadmap roadmapEntity) {
        RoadmapResponse roadmap = roadmapEntity == null ? null : roadmapService.toResponseForInternal(roadmapEntity);
        int total = roadmap == null ? 0 : roadmap.getMilestones().stream().mapToInt(m -> m.getTasks() == null ? 0 : m.getTasks().size()).sum();
        Set<String> completedKeys = tasks.stream().filter(ProgressTaskEntry::isCompleted)
                .filter(t -> Objects.equals(t.getGoal().getId(), goal.getId()))
                .map(t -> key(t.getMilestoneTitle(), t.getTaskTitle())).collect(Collectors.toSet());
        int completed = completedKeys.size();
        int percent = total == 0 ? 0 : Math.min(100, Math.round(completed * 100f / total));
        LocalDate last = progress.stream().filter(p -> p.getGoal() != null && Objects.equals(p.getGoal().getId(), goal.getId()))
                .map(ProgressEntry::getEntryDate).filter(Objects::nonNull).max(LocalDate::compareTo).orElse(null);
        String signal;
        if (last == null) signal = "Ready for a first step";
        else {
            long days = ChronoUnit.DAYS.between(last, LocalDate.now());
            signal = days >= 3 ? "Needs a restart" : days == 0 ? "Active today" : "In motion";
        }
        return JourneyOverviewResponse.GoalSnapshot.builder().goalId(goal.getId()).title(goal.getTitle())
                .progressPercent(percent).completedTasks(completed).totalTasks(total).lastActivityDate(last).signal(signal).build();
    }

    private List<JourneyOverviewResponse.TimelineItem> buildTimeline(List<ProgressEntry> progress, List<ProgressTaskEntry> tasks, LocalDate start, LocalDate end) {
        List<JourneyOverviewResponse.TimelineItem> items = new ArrayList<>();
        progress.stream().filter(p -> within(p.getEntryDate(), start, end)).forEach(p -> items.add(JourneyOverviewResponse.TimelineItem.builder()
                .date(p.getEntryDate()).type("PROGRESS").title("Progress logged")
                .detail(p.getNote() == null || p.getNote().isBlank() ? "You checked in on your journey." : p.getNote())
                .goalId(p.getGoal().getId()).build()));
        tasks.stream().filter(t -> within(t.getCompletedAt() == null ? null : t.getCompletedAt().toLocalDate(), start, end)).forEach(t -> items.add(JourneyOverviewResponse.TimelineItem.builder()
                .date(t.getCompletedAt().toLocalDate()).type("TASK").title(t.getTaskTitle())
                .detail(t.getMilestoneTitle()).goalId(t.getGoal().getId()).build()));
        items.sort(Comparator.comparing(JourneyOverviewResponse.TimelineItem::getDate).reversed());
        return items.stream().limit(14).toList();
    }

    private String buildHeadline(int activeDays, int tasks, int previousDays, int previousTasks, int goals) {
        if (goals == 0) return "Your journey starts with one meaningful goal.";
        if (activeDays == 0) return "A quiet week is still a useful signal.";
        if (activeDays > previousDays || tasks > previousTasks) return "You are building momentum.";
        if (activeDays == previousDays && tasks == previousTasks) return "Your rhythm is holding steady.";
        return "Your week is ready for a reset.";
    }

    private String buildSummary(int activeDays, int tasks, int entries, int previousDays, int previousTasks) {
        String base = "You showed up on " + activeDays + " of the last 7 days and completed " + tasks + " task" + (tasks == 1 ? "" : "s") + ".";
        if (activeDays == 0) return "No progress was logged in the last 7 days. Start with one small action instead of trying to catch up all at once.";
        if (activeDays > previousDays || tasks > previousTasks) return base + " Your activity is up compared with the previous 7-day window.";
        if (activeDays < previousDays || tasks < previousTasks) return base + " Activity is lower than the previous 7-day window; a smaller, more repeatable routine may help.";
        return base + " Your activity is similar to the previous 7-day window.";
    }

    private List<String> buildPrompts(int activeDays, int tasks, int previousDays, int previousTasks, List<JourneyOverviewResponse.GoalSnapshot> goals) {
        List<String> prompts = new ArrayList<>();
        if (activeDays == 0) prompts.add("What is the smallest action you could complete today?");
        else if (tasks == 0) prompts.add("What did you spend time on that did not become a completed task?");
        else prompts.add("Which completed task created the most useful progress for you?");
        if (activeDays < previousDays) prompts.add("What made it harder to show up this week?");
        else prompts.add("What helped you keep showing up this week?");
        goals.stream().filter(g -> g.getProgressPercent() > 0 && g.getProgressPercent() < 100).findFirst()
                .ifPresent(g -> prompts.add("For \"" + g.getTitle() + "\", what should change about your next week?"));
        return prompts.stream().limit(3).toList();
    }

    private boolean within(LocalDate date, LocalDate start, LocalDate end) { return date != null && !date.isBefore(start) && !date.isAfter(end); }
    private String key(String milestone, String task) { return (milestone == null ? "" : milestone) + "::" + (task == null ? "" : task); }
}
