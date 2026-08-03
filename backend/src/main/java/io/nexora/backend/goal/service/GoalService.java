package io.nexora.backend.goal.service;

import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.auth.repository.AccountRepository;
import io.nexora.backend.common.exception.ResourceNotFoundException;
import io.nexora.backend.goal.dto.request.CreateGoalRequest;
import io.nexora.backend.goal.dto.request.UpdateGoalRequest;
import io.nexora.backend.goal.dto.response.GoalResponse;
import io.nexora.backend.goal.entity.Goal;
import io.nexora.backend.goal.enums.GoalStatus;
import io.nexora.backend.goal.mapper.GoalMapper;
import io.nexora.backend.goal.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final GoalMapper goalMapper;
    private final AccountRepository accountRepository;

    private Account getAccount(String email) {
        return accountRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
    }

    private Goal getAuthorizedGoal(UUID goalId, String email) {

        Goal goal = goalRepository.findByIdAndDeletedFalse(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (!goal.getAccount().getEmail().equals(email)) {
            throw new ResourceNotFoundException("Goal not found");
        }

        return goal;
    }

    public GoalResponse createGoal(CreateGoalRequest request, String email) {

        Account account = getAccount(email);

        Goal goal = Goal.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .currentLevel(request.getCurrentLevel())
                .targetDate(request.getTargetDate())
                .dailyStudyHours(request.getDailyStudyHours())
                .status(GoalStatus.ACTIVE)
                .account(account)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .deleted(false)
                .build();

        return goalMapper.toResponse(goalRepository.save(goal));
    }

    public List<GoalResponse> getGoals(String email) {

        Account account = getAccount(email);

        return goalRepository.findAllByAccountIdAndDeletedFalse(account.getId())
                .stream()
                .map(goalMapper::toResponse)
                .toList();
    }

    public GoalResponse getGoalById(UUID goalId, String email) {

        return goalMapper.toResponse(getAuthorizedGoal(goalId, email));
    }

    public GoalResponse updateGoal(UUID goalId,
                                   UpdateGoalRequest request,
                                   String email) {

        Goal goal = getAuthorizedGoal(goalId, email);

        goal.setTitle(request.getTitle());
        goal.setDescription(request.getDescription());
        goal.setCurrentLevel(request.getCurrentLevel());
        goal.setStatus(request.getStatus());
        goal.setTargetDate(request.getTargetDate());
        goal.setDailyStudyHours(request.getDailyStudyHours());
        goal.setUpdatedAt(Instant.now());

        return goalMapper.toResponse(goalRepository.save(goal));
    }

    public ResponseEntity<Void> deleteGoal(UUID goalId, String email) {

        Goal goal = getAuthorizedGoal(goalId, email);

        goal.setDeleted(true);

        goalRepository.save(goal);

        return ResponseEntity.ok().build();
    }
}