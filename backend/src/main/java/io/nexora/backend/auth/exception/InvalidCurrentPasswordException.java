package io.nexora.backend.auth.exception;

/**
 * Thrown when a change-password request's currentPassword doesn't match
 * the account's stored hash. Kept distinct from BadCredentialsException
 * (used at login) so the response message can be specific to this
 * context ("current password is wrong") rather than the generic
 * "invalid email or password".
 */
public class InvalidCurrentPasswordException extends RuntimeException {
    public InvalidCurrentPasswordException(String message) {
        super(message);
    }
}
