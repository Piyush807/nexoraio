package io.nexora.backend.memory.controller;

import io.nexora.backend.memory.dto.response.GrowthMemoryResponse;
import io.nexora.backend.memory.service.GrowthMemoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/memory")
public class GrowthMemoryController {
    private final GrowthMemoryService growthMemoryService;

    @GetMapping
    public GrowthMemoryResponse getMemory(Authentication authentication) {
        return growthMemoryService.getOrRefresh(authentication.getName());
    }

    @PostMapping("/refresh")
    public ResponseEntity<GrowthMemoryResponse> refresh(Authentication authentication) {
        return ResponseEntity.ok(growthMemoryService.refresh(authentication.getName()));
    }
}
