package io.nexora.backend.progress.controller;

import io.nexora.backend.ai.dto.response.ChatResponse;
import io.nexora.backend.progress.service.DailyCoachService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/goals/{goalId}/coach")
@RequiredArgsConstructor
public class DailyCoachController {

    private final DailyCoachService dailyCoachService;

    @GetMapping("/daily")
    public ResponseEntity<ChatResponse> getDailyCoach(
            @PathVariable UUID goalId,
            Authentication authentication) {

        return ResponseEntity.ok(dailyCoachService.getDailyCoach(goalId, authentication.getName()));
    }
}
