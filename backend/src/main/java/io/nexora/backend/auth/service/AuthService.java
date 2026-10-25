package io.nexora.backend.auth.service;

import io.nexora.backend.auth.dto.request.ChangePasswordRequest;
import io.nexora.backend.auth.dto.request.LoginRequest;
import io.nexora.backend.auth.dto.response.LoginResponse;
import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.auth.dto.request.RegisterRequest;
import io.nexora.backend.auth.dto.response.RegisterResponse;
import io.nexora.backend.auth.enums.Role;
import io.nexora.backend.auth.exception.EmailAlreadyExistsException;
import io.nexora.backend.auth.exception.InvalidCurrentPasswordException;
import io.nexora.backend.auth.repository.AccountRepository;
import io.nexora.backend.common.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AuthService {
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    /**
     * Internal result carrying both tokens. The refresh token must never be
     * serialized into a JSON response body — the controller is responsible
     * for placing it into an httpOnly cookie and returning only the access
     * token (via LoginResponse) in the body.
     */
    public record AuthResult(String accessToken, String tokenType, String refreshToken) {}



    public RegisterResponse register(RegisterRequest request){

        if(accountRepository.findByEmail(request.getEmail()).isPresent()){
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        Account account = Account.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .enabled(true)
                .build();

        Account savedAccount;
        try {
            savedAccount = accountRepository.saveAndFlush(account);
        } catch (DataIntegrityViolationException ex) {
            throw new EmailAlreadyExistsException(request.getEmail());
        }

        return RegisterResponse.builder()
                .id(savedAccount.getId())
                .email(savedAccount.getEmail())
                .message("Registration successful")
                .build();

    }

    public AuthResult login(LoginRequest request){
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new UsernameNotFoundException("User not found"));

        String accessToken = jwtService.generateToken(account);
        String refreshToken = refreshTokenService.issue(account);

        return new AuthResult(accessToken, "Bearer", refreshToken);
    }

    /**
     * Validates and rotates the presented refresh token, returning a fresh
     * access token + refresh token pair. Throws InvalidRefreshTokenException
     * (handled centrally, mapped to 401) if the token is missing, expired,
     * unrecognized, or already used.
     */
    public AuthResult refresh(String presentedRefreshToken){
        RefreshTokenService.IssuedToken rotated = refreshTokenService.rotate(presentedRefreshToken);
        String accessToken = jwtService.generateToken(rotated.account());
        return new AuthResult(accessToken, "Bearer", rotated.rawToken());
    }

    public void logout(String presentedRefreshToken){
        if (presentedRefreshToken != null) {
            refreshTokenService.revoke(presentedRefreshToken);
        }
    }

    /**
     * Verifies the caller's current password, then sets a new one and
     * revokes every other refresh-token session for the account (see
     * RefreshTokenService.revokeAllForAccount for why).
     */
    public void changePassword(String email, ChangePasswordRequest request) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), account.getPasswordHash())) {
            throw new InvalidCurrentPasswordException("Current password is incorrect.");
        }

        account.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);

        refreshTokenService.revokeAllForAccount(account);
    }
}
