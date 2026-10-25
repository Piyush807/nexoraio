package io.nexora.backend.auth.service;

import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.auth.entity.RefreshToken;
import io.nexora.backend.auth.exception.InvalidRefreshTokenException;
import io.nexora.backend.auth.repository.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    private RefreshTokenService refreshTokenService;

    private Account account;

    private static final long REFRESH_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000L; // 7 days

    @BeforeEach
    void setUp() {
        refreshTokenService = new RefreshTokenService(refreshTokenRepository);
        ReflectionTestUtils.setField(refreshTokenService, "refreshExpirationMs", REFRESH_EXPIRATION_MS);

        account = Account.builder()
                .id(UUID.randomUUID())
                .email("student@example.com")
                .passwordHash("hashed")
                .build();

        // save() just echoes back whatever entity it was given, like a real repo would.
        lenient().when(refreshTokenRepository.save(any(RefreshToken.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void issue_returnsRawTokenAndPersistsOnlyItsHash() {
        String rawToken = refreshTokenService.issue(account);

        assertThat(rawToken).isNotBlank();

        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository).save(captor.capture());

        RefreshToken persisted = captor.getValue();
        assertThat(persisted.getAccount()).isEqualTo(account);
        assertThat(persisted.isRevoked()).isFalse();
        assertThat(persisted.getExpiresAt()).isAfter(Instant.now());
        // The raw token itself must never be what's stored.
        assertThat(persisted.getTokenHash()).isNotEqualTo(rawToken);
        // SHA-256 hex digest is always 64 characters.
        assertThat(persisted.getTokenHash()).hasSize(64);
    }

    @Test
    void issue_isNotDeterministic_acrossCalls() {
        String first = refreshTokenService.issue(account);
        String second = refreshTokenService.issue(account);

        assertThat(first).isNotEqualTo(second);
    }

    @Test
    void rotate_validToken_revokesOldTokenAndIssuesNewOne() {
        String rawToken = refreshTokenService.issue(account);
        RefreshToken existing = capturedToken();
        String presentedHash = existing.getTokenHash();

        when(refreshTokenRepository.findByTokenHash(presentedHash)).thenReturn(Optional.of(existing));

        RefreshTokenService.IssuedToken result = refreshTokenService.rotate(rawToken);

        assertThat(result.account()).isEqualTo(account);
        assertThat(result.rawToken()).isNotEqualTo(rawToken);

        // The old token must be marked revoked and linked to its replacement.
        assertThat(existing.isRevoked()).isTrue();
        assertThat(existing.getReplacedByTokenId()).isNotNull();

        // A reuse-detection sweep must NOT fire for a normal, valid rotation.
        verify(refreshTokenRepository, never()).revokeAllForAccount(any());
    }

    @Test
    void rotate_alreadyRevokedToken_treatsAsTheftAndRevokesEverySessionForAccount() {
        RefreshToken alreadyUsed = RefreshToken.builder()
                .id(UUID.randomUUID())
                .account(account)
                .tokenHash("some-hash")
                .expiresAt(Instant.now().plusSeconds(60))
                .revoked(true) // already rotated/used once before
                .build();

        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(alreadyUsed));

        assertThatThrownBy(() -> refreshTokenService.rotate("stolen-token"))
                .isInstanceOf(InvalidRefreshTokenException.class);

        // Reuse of a revoked token is treated as compromise: nuke every
        // refresh token for that account, forcing re-login everywhere.
        verify(refreshTokenRepository).revokeAllForAccount(account);
    }

    @Test
    void rotate_expiredToken_throwsWithoutTriggeringAccountWideRevocation() {
        RefreshToken expired = RefreshToken.builder()
                .id(UUID.randomUUID())
                .account(account)
                .tokenHash("some-hash")
                .expiresAt(Instant.now().minus(1, ChronoUnit.DAYS))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(expired));

        assertThatThrownBy(() -> refreshTokenService.rotate("expired-token"))
                .isInstanceOf(InvalidRefreshTokenException.class);

        // Plain expiry is not evidence of theft — don't nuke every session for it.
        verify(refreshTokenRepository, never()).revokeAllForAccount(any());
    }

    @Test
    void rotate_unknownToken_throwsInvalidRefreshTokenException() {
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> refreshTokenService.rotate("never-issued"))
                .isInstanceOf(InvalidRefreshTokenException.class);
    }

    @Test
    void revoke_existingToken_marksItRevoked() {
        RefreshToken existing = RefreshToken.builder()
                .id(UUID.randomUUID())
                .account(account)
                .tokenHash("some-hash")
                .expiresAt(Instant.now().plusSeconds(60))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(existing));

        refreshTokenService.revoke("some-raw-token");

        assertThat(existing.isRevoked()).isTrue();
        verify(refreshTokenRepository).save(existing);
    }

    @Test
    void revoke_unknownToken_doesNothingAndDoesNotThrow() {
        when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.empty());

        refreshTokenService.revoke("never-issued");

        verify(refreshTokenRepository, never()).save(any());
    }

    private RefreshToken capturedToken() {
        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository).save(captor.capture());
        return captor.getValue();
    }
}
