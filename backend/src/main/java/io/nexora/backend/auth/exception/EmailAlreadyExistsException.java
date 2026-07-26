package io.nexora.backend.auth.exception;

import io.nexora.backend.auth.Account;

public class EmailAlreadyExistsException extends RuntimeException {
    public EmailAlreadyExistsException(String email) {
        super("Account with email " +email+ " already exists");
    }
}
