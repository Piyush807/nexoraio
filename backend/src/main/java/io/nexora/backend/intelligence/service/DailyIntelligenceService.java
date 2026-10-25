package io.nexora.backend.intelligence.service;

import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.auth.repository.AccountRepository;
import io.nexora.backend.common.exception.ResourceNotFoundException;
import io.nexora.backend.goal.entity.Goal;
import io.nexora.backend.goal.enums.GoalStatus;
import io.nexora.backend.goal.repository.GoalRepository;
import io.nexora.backend.intelligence.dto.response.DailyIntelligenceResponse;
import io.nexora.backend.progress.entity.ProgressEntry;
import io.nexora.backend.progress.entity.ProgressTaskEntry;
import io.nexora.backend.progress.repository.ProgressEntryRepository;
import io.nexora.backend.progress.repository.ProgressTaskEntryRepository;
import io.nexora.backend.roadmap.dto.response.RoadmapMilestoneResponse;
import io.nexora.backend.roadmap.dto.response.RoadmapResponse;
import io.nexora.backend.roadmap.service.RoadmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DailyIntelligenceService {
    private final AccountRepository accountRepository;
    private final GoalRepository goalRepository;
    private final ProgressEntryRepository progressEntryRepository;
    private final ProgressTaskEntryRepository progressTaskEntryRepository;
    private final RoadmapService roadmapService;

    public DailyIntelligenceResponse getToday(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
        List<Goal> activeGoals = goalRepository.findAllByAccountIdAndDeletedFalse(account.getId())
                .stream()
                .filter(g -> g.getStatus() == GoalStatus.ACTIVE)
                .toList();

        if (activeGoals.isEmpty()) {
            return DailyIntelligenceResponse.builder()
                    .date(LocalDate.now())
                    .headline("Start with one meaningful goal")
                    .reason("Nexora needs a goal before it can understand what should matter today.")
                    .nextAction("Create your first goal")
                    .completedTasks(0)
                    .totalTasks(0)
                    .progressPercent(0)
                    .inactiveDays(-1)
                    .needsRestart(false)
                    .roadmapAvailable(false)
                    .build();
        }

        LocalDate today = LocalDate.now();
        List<ProgressEntry> accountProgress = progressEntryRepository.findAllByActiveGoalAccountIdOrderByEntryDateDesc(account.getId());
        java.util.Map<UUID, ProgressEntry> latestByGoal = accountProgress.stream()
                .filter(p -> p.getGoal() != null)
                .collect(java.util.stream.Collectors.toMap(p -> p.getGoal().getId(), p -> p, (a, b) -> a));
        Goal focus = activeGoals.stream()
                .max(Comparator.comparingDouble(g -> score(g, today, latestByGoal.get(g.getId()))))
                .orElse(activeGoals.get(0));

        RoadmapResponse roadmap = roadmapService.getRoadmapByGoalIdOrNull(focus.getId());
        List<ProgressTaskEntry> completed = progressTaskEntryRepository
                .findAllByGoalIdOrderByCompletedAtDesc(focus.getId());
        Set<String> completedTitles = new HashSet<>();
        int completedCount = 0;
        for (ProgressTaskEntry entry : completed) {
            if (entry.isCompleted() && entry.getTaskTitle() != null && completedTitles.add(taskKey(entry.getMilestoneTitle(), entry.getTaskTitle()))) {
                completedCount++;
            }
        }

        int totalTasks = roadmap == null ? 0 : roadmap.getMilestones().stream()
                .mapToInt(m -> m.getTasks() == null ? 0 : m.getTasks().size())
                .sum();
        int progressPercent = totalTasks == 0 ? 0 : Math.min(100, Math.round((completedCount * 100f) / totalTasks));

        String nextAction = null;
        String milestoneTitle = null;
        if (roadmap != null) {
            for (RoadmapMilestoneResponse milestone : roadmap.getMilestones()) {
                if (milestone.isCompleted() || milestone.getTasks() == null) continue;
                for (String task : milestone.getTasks()) {
                    if (task != null && !completedTitles.contains(taskKey(milestone.getTitle(), task))) {
                        nextAction = task;
                        milestoneTitle = milestone.getTitle();
                        break;
                    }
                }
                if (nextAction != null) break;
            }
        }

        ProgressEntry latest = latestByGoal.get(focus.getId());
        long inactiveDays = latest == null ? -1 : Math.max(0, ChronoUnit.DAYS.between(latest.getEntryDate(), today));
        boolean needsRestart = inactiveDays >= 3;

        String headline;
        String reason;
        if (nextAction == null && roadmap != null && totalTasks > 0 && completedCount >= totalTasks) {
            headline = "Your roadmap is complete";
            reason = "You have completed every tracked task for this roadmap. Reflect on the outcome or decide what you want to pursue next.";
            nextAction = "Review your progress and choose the next direction";
        } else if (needsRestart) {
            headline = "Restart small today";
            reason = inactiveDays + " days have passed since your last progress entry for this goal. A small action is enough to restart momentum.";
            nextAction = nextAction == null ? "Open the roadmap and choose one small task" : nextAction;
        } else if (nextAction != null) {
            headline = "Your next best step is clear";
            reason = "This is the first unfinished task in your current roadmap, so completing it keeps your path moving without adding unnecessary work.";
        } else {
            headline = "Clarify your next step";
            reason = "Your goal is active, but Nexora does not have a tracked unfinished task yet.";
            nextAction = "Open this goal and review its roadmap";
        }

        return DailyIntelligenceResponse.builder()
                .date(today)
                .focusGoalId(focus.getId())
                .focusGoalTitle(focus.getTitle())
                .headline(headline)
                .reason(reason.trim())
                .nextAction(nextAction)
                .milestoneTitle(milestoneTitle)
                .completedTasks(completedCount)
                .totalTasks(totalTasks)
                .progressPercent(progressPercent)
                .inactiveDays(inactiveDays)
                .needsRestart(needsRestart)
                .roadmapAvailable(roadmap != null)
                .build();
    }

    private String taskKey(String milestoneTitle, String taskTitle) {
        return (milestoneTitle == null ? "" : milestoneTitle) + "::" + (taskTitle == null ? "" : taskTitle);
    }

    private double score(Goal goal, LocalDate today, ProgressEntry latest) {
        double score = 0;
        if (goal.getTargetDate() != null) {
            long days = ChronoUnit.DAYS.between(today, goal.getTargetDate());
            score += days <= 0 ? 100 : days <= 7 ? 70 : days <= 30 ? 40 : 10;
        }
        if (latest == null) score += 35;
        else score += Math.min(35, Math.max(0, ChronoUnit.DAYS.between(latest.getEntryDate(), today)) * 5);
        return score;
    }
}
