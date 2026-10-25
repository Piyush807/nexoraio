package io.nexora.backend.auth.controller;

import io.nexora.backend.auth.dto.request.ChangePasswordRequest;
import io.nexora.backend.auth.dto.request.LoginRequest;
import io.nexora.backend.auth.dto.request.RegisterRequest;
import io.nexora.backend.auth.dto.response.LoginResponse;
import io.nexora.backend.auth.dto.response.MeResponse;
import io.nexora.backend.auth.dto.response.RegisterResponse;
import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.auth.exception.InvalidRefreshTokenException;
import io.nexora.backend.auth.service.AuthService;
import io.nexora.backend.common.security.CustomUserDetails;
import io.nexora.backend.common.security.RefreshCookieFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    private final RefreshCookieFactory refreshCookieFactory;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest registerRequest) {
        RegisterResponse registerResponse = authService.register(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(registerResponse.getMessage());
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        AuthService.AuthResult result = authService.login(request);
        ResponseCookie cookie = refreshCookieFactory.build(result.refreshToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(LoginResponse.builder()
                        .accessToken(result.accessToken())
                        .tokenType(result.tokenType())
                        .build());
    }

    /**
     * Exchanges the httpOnly refresh-token cookie for a new access token,
     * rotating the refresh token in the process. Returns 401 if there is no
     * cookie, or if it is invalid/expired/already used.
     */
    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            @CookieValue(value = RefreshCookieFactory.COOKIE_NAME, required = false) String refreshToken) {

        if (refreshToken == null) {
            throw new InvalidRefreshTokenException("No refresh token presented.");
        }

        AuthService.AuthResult result = authService.refresh(refreshToken);
        ResponseCookie cookie = refreshCookieFactory.build(result.refreshToken());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(LoginResponse.builder()
                        .accessToken(result.accessToken())
                        .tokenType(result.tokenType())
                        .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(value = RefreshCookieFactory.COOKIE_NAME, required = false) String refreshToken) {

        authService.logout(refreshToken);
        ResponseCookie cleared = refreshCookieFactory.clear();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cleared.toString())
                .build();
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

    @PatchMapping("/password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {

        authService.changePassword(authentication.getName(), request);
        return ResponseEntity.noContent().build();
    }

}
