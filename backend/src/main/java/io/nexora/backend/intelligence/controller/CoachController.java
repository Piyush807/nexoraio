package io.nexora.backend.intelligence.controller;

import io.nexora.backend.intelligence.dto.request.CoachRequest;
import io.nexora.backend.intelligence.dto.response.CoachResponse;
import io.nexora.backend.intelligence.service.CoachService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/goals/{goalId}/intelligence")
@RequiredArgsConstructor
public class CoachController {
    private final CoachService coachService;

    @PostMapping("/coach")
    public ResponseEntity<CoachResponse> coach(
            @PathVariable UUID goalId,
            @Valid @RequestBody CoachRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(coachService.coach(goalId, request.mode(), authentication.getName()));
    }
}
