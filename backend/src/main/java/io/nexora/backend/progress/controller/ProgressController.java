package io.nexora.backend.progress.controller;

import io.nexora.backend.progress.dto.request.CreateProgressEntryRequest;
import io.nexora.backend.progress.dto.response.ProgressEntryResponse;
import io.nexora.backend.progress.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/goals/{goalId}/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @PostMapping
    public ResponseEntity<ProgressEntryResponse> recordProgress(
            @PathVariable UUID goalId,
            @RequestBody CreateProgressEntryRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(progressService.recordProgress(goalId, authentication.getName(), request));
    }

    @GetMapping
    public ResponseEntity<List<ProgressEntryResponse>> getProgress(
            @PathVariable UUID goalId,
            Authentication authentication) {

        return ResponseEntity.ok(progressService.getProgress(goalId, authentication.getName()));
    }
}
