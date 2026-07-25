package io.nexora.backend.health.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class HealthResponse {

    private String status;
    private String application;
    private String version;
    private LocalDateTime timestamp;
}
