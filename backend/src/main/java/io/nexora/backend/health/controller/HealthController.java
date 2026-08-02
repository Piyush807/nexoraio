package io.nexora.backend.health.controller;

import io.nexora.backend.health.dto.HealthResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
public class HealthController {

    @GetMapping("/api/v1/health")
    public HealthResponse getHealth() {
        return new HealthResponse(
                "UP",
                "NEXORA",
                "1.0.0",
                LocalDateTime.now()
        );
    }
  //  @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/secure")
    public String me(Authentication authentication) {
        return authentication.getName();

    }

}
