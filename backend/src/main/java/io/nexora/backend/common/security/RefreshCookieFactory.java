package io.nexora.backend.common.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class RefreshCookieFactory {

    public static final String COOKIE_NAME = "refreshToken";

    @Value("${jwt.refresh-expiration}")
    private long refreshExpirationMs;

    // Disabled in dev over plain http://localhost; must be true in any real deployment (https).
    @Value("${cookie.secure:false}")
    private boolean secure;

    @Value("${cookie.same-site:Strict}")
    private String sameSite;

    public ResponseCookie build(String rawToken) {
        return ResponseCookie.from(COOKIE_NAME, rawToken)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/api/v1/auth")
                .maxAge(Duration.ofMillis(refreshExpirationMs))
                .build();
    }

    public ResponseCookie clear() {
        return ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/api/v1/auth")
                .maxAge(0)
                .build();
    }
}
