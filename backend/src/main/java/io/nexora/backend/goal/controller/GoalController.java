package io.nexora.backend.goal.controller;

import io.nexora.backend.goal.dto.request.CreateGoalRequest;
import io.nexora.backend.goal.dto.request.UpdateGoalRequest;
import io.nexora.backend.goal.dto.response.GoalResponse;
import io.nexora.backend.goal.service.GoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/goals")
public class GoalController {

    private final GoalService goalService;

    @PostMapping
    public GoalResponse createGoal(
            @Valid @RequestBody CreateGoalRequest request,
            Authentication authentication) {

        return goalService.createGoal(request, authentication.getName());
    }

    @GetMapping
    public List<GoalResponse> getGoals(Authentication authentication) {
        return goalService.getGoals(authentication.getName());
    }

    @GetMapping("/{goalId}")
    public GoalResponse getGoalById(
            @PathVariable UUID goalId,
            Authentication authentication) {

        return goalService.getGoalById(goalId, authentication.getName());
    }

    @PutMapping("/{goalId}")
    public GoalResponse updateGoal(
            @PathVariable UUID goalId,
            @Valid @RequestBody UpdateGoalRequest request,
            Authentication authentication) {

        return goalService.updateGoal(goalId, request, authentication.getName());
    }

    @DeleteMapping("/{goalId}")
    public ResponseEntity<Void> deleteGoal(
            @PathVariable UUID goalId,
            Authentication authentication) {

        return goalService.deleteGoal(goalId, authentication.getName());
    }
}