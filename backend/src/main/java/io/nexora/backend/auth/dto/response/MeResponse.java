package io.nexora.backend.auth.dto.response;

import io.nexora.backend.auth.enums.Role;

public record MeResponse(
        String email,
        Role role,
        boolean enabled
) {}