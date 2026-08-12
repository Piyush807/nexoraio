package io.nexora.backend.roadmap.controller;

import io.nexora.backend.roadmap.dto.response.RoadmapResponse;
import io.nexora.backend.roadmap.service.RoadmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/goals/{goalId}/roadmap")
@RequiredArgsConstructor
public class RoadmapController {

    private final RoadmapService roadmapService;

    @PostMapping
    public ResponseEntity<RoadmapResponse> generateRoadmap(
            @PathVariable UUID goalId,
            Authentication authentication) {

        return ResponseEntity.ok(roadmapService.generateRoadmap(goalId, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<RoadmapResponse> getRoadmapByGoalId(
            @PathVariable UUID goalId,
            Authentication authentication) {

        return ResponseEntity.ok(roadmapService.getRoadmapByGoalId(goalId, authentication.getName()));
    }
}
