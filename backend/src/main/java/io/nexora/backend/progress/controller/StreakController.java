package io.nexora.backend.progress.controller;

import io.nexora.backend.progress.dto.response.StreakResponse;
import io.nexora.backend.progress.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Account-level (not goal-scoped) progress endpoints — currently just the
 * cross-goal streak. Deliberately a separate controller from
 * ProgressController, which is nested under /goals/{goalId}/progress and
 * always requires a specific goal.
 */
@RestController
@RequestMapping("/api/v1/progress")
@RequiredArgsConstructor
public class StreakController {

    private final ProgressService progressService;

    @GetMapping("/streak")
    public ResponseEntity<StreakResponse> getStreak(Authentication authentication) {
        return ResponseEntity.ok(progressService.getStreak(authentication.getName()));
    }
}
