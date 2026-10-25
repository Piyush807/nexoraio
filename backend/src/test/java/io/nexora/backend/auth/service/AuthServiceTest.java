package io.nexora.backend.auth.service;

import io.nexora.backend.auth.dto.request.ChangePasswordRequest;
import io.nexora.backend.auth.dto.request.LoginRequest;
import io.nexora.backend.auth.dto.request.RegisterRequest;
import io.nexora.backend.auth.dto.response.RegisterResponse;
import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.auth.enums.Role;
import io.nexora.backend.auth.exception.EmailAlreadyExistsException;
import io.nexora.backend.auth.exception.InvalidCurrentPasswordException;
import io.nexora.backend.auth.repository.AccountRepository;
import io.nexora.backend.common.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private AccountRepository accountRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private JwtService jwtService;
    @Mock private RefreshTokenService refreshTokenService;

    private AuthService authService;

    private Account account;

    @BeforeEach
    void setUp() {
        authService = new AuthService(accountRepository, passwordEncoder, authenticationManager, jwtService, refreshTokenService);
        account = Account.builder()
                .id(UUID.randomUUID())
                .email("student@example.com")
                .passwordHash("hashed-password")
                .role(Role.STUDENT)
                .enabled(true)
                .build();
    }

    // --- register ---

    @Test
    void register_newEmail_createsStudentAccountWithEncodedPassword() {
        RegisterRequest request = new RegisterRequest("student@example.com", "plaintext-pw");
        when(accountRepository.findByEmail("student@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("plaintext-pw")).thenReturn("encoded-pw");
        when(accountRepository.save(any(Account.class))).thenAnswer(inv -> {
            Account a = inv.getArgument(0);
            a.setId(UUID.randomUUID());
            return a;
        });

        RegisterResponse response = authService.register(request);

        ArgumentCaptor<Account> captor = ArgumentCaptor.forClass(Account.class);
        verify(accountRepository).save(captor.capture());
        Account saved = captor.getValue();

        assertThat(saved.getPasswordHash()).isEqualTo("encoded-pw");
        assertThat(saved.getRole()).isEqualTo(Role.STUDENT);
        assertThat(saved.isEnabled()).isTrue();
        assertThat(response.getEmail()).isEqualTo("student@example.com");
    }

    @Test
    void register_emailAlreadyExists_throwsWithoutSaving() {
        RegisterRequest request = new RegisterRequest("student@example.com", "pw");
        when(accountRepository.findByEmail("student@example.com")).thenReturn(Optional.of(account));

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(EmailAlreadyExistsException.class);

        verify(accountRepository, never()).save(any());
    }

    // --- login ---

    @Test
    void login_validCredentials_returnsBothAccessAndRefreshTokens() {
        LoginRequest request = new LoginRequest("student@example.com", "correct-pw");
        when(accountRepository.findByEmail("student@example.com")).thenReturn(Optional.of(account));
        when(jwtService.generateToken(account)).thenReturn("access-token-123");
        when(refreshTokenService.issue(account)).thenReturn("refresh-token-456");

        AuthService.AuthResult result = authService.login(request);

        assertThat(result.accessToken()).isEqualTo("access-token-123");
        assertThat(result.refreshToken()).isEqualTo("refresh-token-456");
        assertThat(result.tokenType()).isEqualTo("Bearer");
        verify(authenticationManager).authenticate(any());
    }

    @Test
    void login_badCredentials_propagatesAndNeverIssuesTokens() {
        LoginRequest request = new LoginRequest("student@example.com", "wrong-pw");
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("bad creds"));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);

        verifyNoInteractions(refreshTokenService, jwtService);
    }

    @Test
    void login_accountVanishesAfterAuthentication_throwsUsernameNotFound() {
        // Edge case: authentication succeeds but the account lookup right after fails.
        LoginRequest request = new LoginRequest("ghost@example.com", "pw");
        when(accountRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    // --- refresh ---

    @Test
    void refresh_validToken_rotatesAndReturnsNewAccessToken() {
        RefreshTokenService.IssuedToken rotated = new RefreshTokenService.IssuedToken("new-raw-refresh", account);
        when(refreshTokenService.rotate("old-raw-refresh")).thenReturn(rotated);
        when(jwtService.generateToken(account)).thenReturn("new-access-token");

        AuthService.AuthResult result = authService.refresh("old-raw-refresh");

        assertThat(result.accessToken()).isEqualTo("new-access-token");
        assertThat(result.refreshToken()).isEqualTo("new-raw-refresh");
    }

    // --- logout ---

    @Test
    void logout_withToken_revokesIt() {
        authService.logout("some-refresh-token");

        verify(refreshTokenService).revoke("some-refresh-token");
    }

    @Test
    void logout_withNullToken_doesNotCallRevoke() {
        authService.logout(null);

        verify(refreshTokenService, never()).revoke(any());
    }

    // --- changePassword ---

    @Test
    void changePassword_correctCurrentPassword_updatesHashAndRevokesOtherSessions() {
        ChangePasswordRequest request = new ChangePasswordRequest("correct-current-pw", "new-strong-pw");
        when(accountRepository.findByEmail("student@example.com")).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("correct-current-pw", "hashed-password")).thenReturn(true);
        when(passwordEncoder.encode("new-strong-pw")).thenReturn("new-encoded-hash");

        authService.changePassword("student@example.com", request);

        ArgumentCaptor<Account> captor = ArgumentCaptor.forClass(Account.class);
        verify(accountRepository).save(captor.capture());
        assertThat(captor.getValue().getPasswordHash()).isEqualTo("new-encoded-hash");
        verify(refreshTokenService).revokeAllForAccount(account);
    }

    @Test
    void changePassword_wrongCurrentPassword_throwsWithoutSavingOrRevoking() {
        ChangePasswordRequest request = new ChangePasswordRequest("wrong-current-pw", "new-strong-pw");
        when(accountRepository.findByEmail("student@example.com")).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("wrong-current-pw", "hashed-password")).thenReturn(false);

        assertThatThrownBy(() -> authService.changePassword("student@example.com", request))
                .isInstanceOf(InvalidCurrentPasswordException.class);

        verify(accountRepository, never()).save(any());
        verify(refreshTokenService, never()).revokeAllForAccount(any());
    }

    @Test
    void changePassword_accountNotFound_throwsUsernameNotFound() {
        ChangePasswordRequest request = new ChangePasswordRequest("any-pw", "new-strong-pw");
        when(accountRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.changePassword("ghost@example.com", request))
                .isInstanceOf(UsernameNotFoundException.class);

        verify(passwordEncoder, never()).matches(any(), any());
    }
}
