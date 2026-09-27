package com.foodwaste.backend.exception;

public class EmailAlreadyExistsException extends RuntimeException {
    
    public EmailAlreadyExistsException(String message) {
        super(message);
    }
    
    public EmailAlreadyExistsException(String email, String additionalInfo) {
        super(String.format("Email '%s' is already registered. %s", email, additionalInfo));
    }
}