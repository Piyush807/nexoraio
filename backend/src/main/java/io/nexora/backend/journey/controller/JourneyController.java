package io.nexora.backend.journey.controller;

import io.nexora.backend.journey.dto.response.JourneyOverviewResponse;
import io.nexora.backend.journey.service.JourneyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/journey")
@RequiredArgsConstructor
public class JourneyController {
    private final JourneyService journeyService;

    @GetMapping("/overview")
    public JourneyOverviewResponse overview(Authentication authentication) {
        return journeyService.getOverview(authentication.getName());
    }
}
