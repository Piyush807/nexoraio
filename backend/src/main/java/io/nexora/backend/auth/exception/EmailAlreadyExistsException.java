package io.nexora.backend.auth.exception;

public class EmailAlreadyExistsException extends RuntimeException {
    public EmailAlreadyExistsException(String email) {
        super("Account with email " +email+ " already exists");
    }
}
