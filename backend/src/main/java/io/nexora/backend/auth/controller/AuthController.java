package io.nexora.backend.auth.controller;

import io.nexora.backend.auth.dto.request.LoginRequest;
import io.nexora.backend.auth.dto.request.RegisterRequest;
import io.nexora.backend.auth.dto.response.LoginResponse;
import io.nexora.backend.auth.dto.response.MeResponse;
import io.nexora.backend.auth.dto.response.RegisterResponse;
import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.auth.service.AuthService;
import io.nexora.backend.common.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest registerRequest) {
        RegisterResponse registerResponse = authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(registerResponse.getMessage());
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public MeResponse me(Authentication authentication) {

        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        Account account = userDetails.getAccount();

        return new MeResponse(
                account.getEmail(),
                account.getRole(),
                account.isEnabled()
        );
    }

}
