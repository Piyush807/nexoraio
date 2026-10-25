package io.nexora.backend.memory.service;

import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.auth.repository.AccountRepository;
import io.nexora.backend.common.exception.ResourceNotFoundException;
import io.nexora.backend.goal.entity.Goal;
import io.nexora.backend.goal.enums.GoalStatus;
import io.nexora.backend.goal.repository.GoalRepository;
import io.nexora.backend.memory.dto.response.GrowthMemoryResponse;
import io.nexora.backend.memory.entity.GrowthMemory;
import io.nexora.backend.memory.repository.GrowthMemoryRepository;
import io.nexora.backend.progress.entity.ProgressEntry;
import io.nexora.backend.progress.entity.ProgressTaskEntry;
import io.nexora.backend.progress.repository.ProgressEntryRepository;
import io.nexora.backend.progress.repository.ProgressTaskEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

@Service
public class GrowthMemoryService {
    private final GrowthMemoryRepository memoryRepository;
    private final AccountRepository accountRepository;
    private final GoalRepository goalRepository;
    private final ProgressEntryRepository progressEntryRepository;
    private final ProgressTaskEntryRepository progressTaskEntryRepository;

    public GrowthMemoryService(GrowthMemoryRepository memoryRepository, AccountRepository accountRepository,
                               GoalRepository goalRepository, ProgressEntryRepository progressEntryRepository,
                               ProgressTaskEntryRepository progressTaskEntryRepository) {
        this.memoryRepository = memoryRepository;
        this.accountRepository = accountRepository;
        this.goalRepository = goalRepository;
        this.progressEntryRepository = progressEntryRepository;
        this.progressTaskEntryRepository = progressTaskEntryRepository;
    }

    @Transactional
    public GrowthMemoryResponse getOrRefresh(String email) {
        Account account = getAccount(email);
        return memoryRepository.findByAccountId(account.getId())
                .map(this::toResponse)
                .orElseGet(() -> toResponse(buildMemory(account)));
    }

    @Transactional
    public GrowthMemoryResponse refresh(String email) {
        return toResponse(buildMemory(getAccount(email)));
    }

    @Transactional
    public void touchConversation(String email) {
        Account account = getAccount(email);
        GrowthMemory memory = memoryRepository.findByAccountId(account.getId())
                .orElseGet(() -> buildMemory(account));
        memory.setLastConversationAt(Instant.now());
        memory.setUpdatedAt(Instant.now());
        memoryRepository.save(memory);
    }

    private GrowthMemory buildMemory(Account account) {
        List<Goal> goals = goalRepository.findAllByAccountIdAndDeletedFalse(account.getId());
        List<Goal> activeGoals = goals.stream().filter(g -> g.getStatus() == GoalStatus.ACTIVE).toList();
        List<ProgressEntry> allProgress = progressEntryRepository.findAllByActiveGoalAccountIdOrderByEntryDateDesc(account.getId());
        List<ProgressTaskEntry> completedTasks = progressTaskEntryRepository.findAllByActiveGoalAccountIdAndCompletedTrueOrderByCompletedAtDesc(account.getId());

        LocalDate today = LocalDate.now();
        LocalDate lastActivity = allProgress.stream().map(ProgressEntry::getEntryDate).max(LocalDate::compareTo).orElse(null);
        long recentEntries = allProgress.stream().filter(p -> !p.getEntryDate().isBefore(today.minusDays(6)))
                .map(ProgressEntry::getEntryDate).distinct().count();
        long recentTasks = completedTasks.stream()
                .filter(p -> p.getCompletedAt() != null && !p.getCompletedAt().isBefore(today.minusDays(6).atStartOfDay()))
                .count();
        Goal focus = chooseFocus(activeGoals, allProgress, today);
        long inactiveDays = lastActivity == null ? -1 : ChronoUnit.DAYS.between(lastActivity, today);

        GrowthMemory memory = memoryRepository.findByAccountId(account.getId())
                .orElseGet(() -> GrowthMemory.builder().account(account).build());
        memory.setJourneySummary(buildSummary(activeGoals, completedTasks.size(), recentEntries));
        memory.setCurrentFocus(buildFocus(focus, inactiveDays, recentTasks));
        memory.setStrengths(buildStrengths(activeGoals, completedTasks.size(), recentEntries));
        memory.setFrictionPoints(buildFriction(activeGoals, inactiveDays, recentTasks));
        memory.setPatterns(buildPatterns(recentEntries, recentTasks, allProgress));
        memory.setLastActivityDate(lastActivity);
        memory.setUpdatedAt(Instant.now());
        return memoryRepository.save(memory);
    }

    private Goal chooseFocus(List<Goal> goals, List<ProgressEntry> progress, LocalDate today) {
        return goals.stream().max(Comparator.comparingDouble(g -> focusScore(g, progress, today))).orElse(null);
    }

    private double focusScore(Goal goal, List<ProgressEntry> progress, LocalDate today) {
        double score = 0;
        if (goal.getTargetDate() != null) {
            long days = ChronoUnit.DAYS.between(today, goal.getTargetDate());
            score += days <= 0 ? 100 : days <= 7 ? 70 : days <= 30 ? 40 : 10;
        }
        LocalDate last = progress.stream()
                .filter(p -> p.getGoal() != null && goal.getId().equals(p.getGoal().getId()))
                .map(ProgressEntry::getEntryDate).max(LocalDate::compareTo).orElse(null);
        if (last == null) score += 35;
        else score += Math.min(35, ChronoUnit.DAYS.between(last, today) * 5);
        return score;
    }

    private String buildSummary(List<Goal> activeGoals, int completedTasks, long recentEntries) {
        if (activeGoals.isEmpty()) return "You have not started an active goal yet.";
        return "You are actively working toward " + activeGoals.size() + (activeGoals.size() == 1 ? " goal" : " goals")
                + ", with " + completedTasks + " completed task" + (completedTasks == 1 ? "" : "s") + ". "
                + (recentEntries > 0 ? "You have shown up on " + recentEntries + " of the last 7 days." : "No progress has been logged in the last 7 days.");
    }

    private String buildFocus(Goal focus, long inactiveDays, long recentTasks) {
        if (focus == null) return "Create your first goal so Nexora can build a path around it.";
        StringBuilder text = new StringBuilder("Keep your attention on \"").append(focus.getTitle()).append("\".");
        if (inactiveDays >= 3) text.append(" You have been away for ").append(inactiveDays).append(" days; restart with one small task.");
        else if (recentTasks > 0) text.append(" You have completed ").append(recentTasks).append(" task").append(recentTasks == 1 ? "" : "s").append(" this week; keep the momentum going.");
        else text.append(" Choose the next unfinished roadmap task and make a small, concrete start.");
        return text.toString();
    }

    private String buildStrengths(List<Goal> activeGoals, int completedTasks, long recentEntries) {
        StringBuilder text = new StringBuilder();
        if (completedTasks > 0) text.append("You follow through on concrete tasks. ");
        if (recentEntries >= 4) text.append("Your recent consistency is strong. ");
        if (activeGoals.size() == 1) text.append("Your attention is concentrated on one active goal.");
        else if (activeGoals.size() > 1) text.append("You are managing multiple active goals.");
        if (text.isEmpty()) text.append("Nexora is still learning your working pattern.");
        return text.toString().trim();
    }

    private String buildFriction(List<Goal> activeGoals, long inactiveDays, long recentTasks) {
        if (activeGoals.isEmpty()) return "No current friction detected because there is no active goal yet.";
        if (inactiveDays >= 3) return "Momentum has dropped after " + inactiveDays + " days without a progress entry.";
        if (recentTasks == 0) return "No task completion has been recorded in the last 7 days.";
        return "No strong friction signal yet. Nexora will keep watching consistency and unfinished work.";
    }

    private String buildPatterns(long recentEntries, long recentTasks, List<ProgressEntry> allProgress) {
        if (allProgress.isEmpty()) return "There is not enough history yet. Your first few weeks will help Nexora learn your rhythm.";
        return "Last 7 days: " + recentEntries + " active day" + (recentEntries == 1 ? "" : "s") + " and "
                + recentTasks + " completed task" + (recentTasks == 1 ? "" : "s") + ".";
    }

    private Account getAccount(String email) {
        return accountRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Account not found"));
    }

    private GrowthMemoryResponse toResponse(GrowthMemory memory) {
        return GrowthMemoryResponse.builder().id(memory.getId()).journeySummary(memory.getJourneySummary())
                .currentFocus(memory.getCurrentFocus()).strengths(memory.getStrengths()).frictionPoints(memory.getFrictionPoints())
                .patterns(memory.getPatterns()).lastActivityDate(memory.getLastActivityDate())
                .lastConversationAt(memory.getLastConversationAt()).updatedAt(memory.getUpdatedAt()).build();
    }
}
