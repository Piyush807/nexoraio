package io.nexora.backend.intelligence.controller;

import io.nexora.backend.intelligence.dto.response.DailyIntelligenceResponse;
import io.nexora.backend.intelligence.service.DailyIntelligenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/intelligence")
public class DailyIntelligenceController {
    private final DailyIntelligenceService dailyIntelligenceService;

    @GetMapping("/today")
    public DailyIntelligenceResponse today(Authentication authentication) {
        return dailyIntelligenceService.getToday(authentication.getName());
    }
}
