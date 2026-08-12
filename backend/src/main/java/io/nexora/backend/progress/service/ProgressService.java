package io.nexora.backend.progress.service;

import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.auth.repository.AccountRepository;
import io.nexora.backend.common.exception.ResourceNotFoundException;
import io.nexora.backend.goal.entity.Goal;
import io.nexora.backend.goal.repository.GoalRepository;
import io.nexora.backend.progress.dto.request.CreateProgressEntryRequest;
import io.nexora.backend.progress.dto.response.ProgressEntryResponse;
import io.nexora.backend.progress.entity.ProgressEntry;
import io.nexora.backend.progress.repository.ProgressEntryRepository;
import io.nexora.backend.roadmap.entity.Roadmap;
import io.nexora.backend.roadmap.repository.RoadmapRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final ProgressEntryRepository progressEntryRepository;
    private final GoalRepository goalRepository;
    private final RoadmapRepository roadmapRepository;
    private final AccountRepository accountRepository;

    @Transactional
    public ProgressEntryResponse recordProgress(UUID goalId, String email, CreateProgressEntryRequest request) {

        Account account = getAccount(email);
        Goal goal = getAuthorizedGoal(goalId, email);
        Roadmap roadmap = roadmapRepository.findByGoalId(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap not found"));

        ProgressEntry progressEntry = ProgressEntry.builder()
                .account(account)
                .goal(goal)
                .roadmap(roadmap)
                .entryDate(request.getEntryDate() != null ? request.getEntryDate() : LocalDate.now())
                .note(request.getNote())
                .completedMilestones(request.getCompletedMilestones())
                .completedTasks(request.getCompletedTasks())
                .growthScore(request.getGrowthScore())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return toResponse(progressEntryRepository.save(progressEntry));
    }

    @Transactional(readOnly = true)
    public List<ProgressEntryResponse> getProgress(UUID goalId, String email) {

        getAuthorizedGoal(goalId, email);

        return progressEntryRepository.findAllByGoalIdOrderByEntryDateDesc(goalId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private Goal getAuthorizedGoal(UUID goalId, String email) {

        Goal goal = goalRepository.findByIdAndDeletedFalse(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (!goal.getAccount().getEmail().equals(email)) {
            throw new ResourceNotFoundException("Goal not found");
        }

        return goal;
    }

    private Account getAccount(String email) {
        return accountRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
    }

    private ProgressEntryResponse toResponse(ProgressEntry progressEntry) {
        return ProgressEntryResponse.builder()
                .id(progressEntry.getId())
                .goalId(progressEntry.getGoal() != null ? progressEntry.getGoal().getId() : null)
                .roadmapId(progressEntry.getRoadmap() != null ? progressEntry.getRoadmap().getId() : null)
                .entryDate(progressEntry.getEntryDate())
                .note(progressEntry.getNote())
                .completedMilestones(progressEntry.getCompletedMilestones())
                .completedTasks(progressEntry.getCompletedTasks())
                .growthScore(progressEntry.getGrowthScore())
                .createdAt(progressEntry.getCreatedAt())
                .updatedAt(progressEntry.getUpdatedAt())
                .build();
    }
}
