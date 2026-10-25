package io.nexora.backend.auth.service;

import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.auth.entity.RefreshToken;
import io.nexora.backend.auth.exception.InvalidRefreshTokenException;
import io.nexora.backend.auth.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${jwt.refresh-expiration}")
    private long refreshExpirationMs;

    public record IssuedToken(String rawToken, Account account) {}

    /**
     * Issues a brand-new refresh token for an account (used at login).
     * Returns the raw token — only this method's caller ever sees it;
     * only its hash is persisted.
     */
    @Transactional
    public String issue(Account account) {
        String rawToken = generateRawToken();
        RefreshToken token = RefreshToken.builder()
                .account(account)
                .tokenHash(hash(rawToken))
                .expiresAt(Instant.now().plus(refreshExpirationMs, ChronoUnit.MILLIS))
                .revoked(false)
                .build();
        refreshTokenRepository.save(token);
        return rawToken;
    }

    /**
     * Validates the presented refresh token and rotates it: the old token
     * is revoked and a new one is issued for the same account. If the
     * presented token has already been revoked, that's a strong signal it
     * was stolen and already used by someone else — as a precaution, every
     * refresh token for that account is revoked, forcing a fresh login
     * everywhere.
     */
    @Transactional
    public IssuedToken rotate(String presentedRawToken) {
        RefreshToken existing = refreshTokenRepository.findByTokenHash(hash(presentedRawToken))
                .orElseThrow(() -> new InvalidRefreshTokenException("Refresh token not recognized."));

        if (existing.isRevoked()) {
            // Reuse of an already-rotated/revoked token — treat as compromise.
            refreshTokenRepository.revokeAllForAccount(existing.getAccount());
            throw new InvalidRefreshTokenException("Refresh token has already been used. All sessions revoked.");
        }

        if (existing.isExpired()) {
            throw new InvalidRefreshTokenException("Refresh token has expired.");
        }

        Account account = existing.getAccount();
        String newRawToken = generateRawToken();
        RefreshToken newToken = RefreshToken.builder()
                .account(account)
                .tokenHash(hash(newRawToken))
                .expiresAt(Instant.now().plus(refreshExpirationMs, ChronoUnit.MILLIS))
                .revoked(false)
                .build();
        refreshTokenRepository.save(newToken);

        existing.setRevoked(true);
        existing.setReplacedByTokenId(newToken.getId());
        refreshTokenRepository.save(existing);

        return new IssuedToken(newRawToken, account);
    }

    @Transactional
    public void revoke(String presentedRawToken) {
        refreshTokenRepository.findByTokenHash(hash(presentedRawToken))
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }

    /**
     * Revokes every active refresh token for an account — used after a
     * password change so any other logged-in session (another browser, a
     * stolen device) can no longer silently refresh its way to a new
     * access token. The current session's access token stays valid until
     * it naturally expires, same as it would for a normal logout elsewhere.
     */
    @Transactional
    public void revokeAllForAccount(Account account) {
        refreshTokenRepository.revokeAllForAccount(account);
    }

    private String generateRawToken() {
        byte[] bytes = new byte[64];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 is guaranteed available on every JVM; this can't happen.
            throw new IllegalStateException(e);
        }
    }

    public long getRefreshExpirationMs() {
        return refreshExpirationMs;
    }
}
