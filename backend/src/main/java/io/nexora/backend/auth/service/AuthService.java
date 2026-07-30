package io.nexora.backend.auth.service;

import io.nexora.backend.auth.dto.request.LoginRequest;
import io.nexora.backend.auth.dto.response.LoginResponse;
import io.nexora.backend.auth.entity.Account;
import io.nexora.backend.auth.dto.request.RegisterRequest;
import io.nexora.backend.auth.dto.response.RegisterResponse;
import io.nexora.backend.auth.enums.Role;
import io.nexora.backend.auth.exception.EmailAlreadyExistsException;
import io.nexora.backend.auth.repository.AccountRepository;
import io.nexora.backend.common.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
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

        Account savedAccount = accountRepository.save(account);

        return RegisterResponse.builder()
                .id(savedAccount.getId())
                .email(savedAccount.getEmail())
                .message("Registration successful")
                .build();

    }

    public LoginResponse login(LoginRequest request){
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(()-> new UsernameNotFoundException("User not found"));
        String token = jwtService.generateToken(account);

        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .build();
    }
}
