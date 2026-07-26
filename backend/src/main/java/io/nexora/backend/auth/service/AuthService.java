package io.nexora.backend.auth.service;

import io.nexora.backend.auth.Account;
import io.nexora.backend.auth.dto.request.RegisterRequest;
import io.nexora.backend.auth.dto.response.RegisterResponse;
import io.nexora.backend.auth.enums.Role;
import io.nexora.backend.auth.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
@RequiredArgsConstructor
@Service
public class AuthService {
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;


    public RegisterResponse register(RegisterRequest request){

        if(accountRepository.findByEmail(request.getEmail()).isPresent()){
            throw new RuntimeException("Email already exists");
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
}
