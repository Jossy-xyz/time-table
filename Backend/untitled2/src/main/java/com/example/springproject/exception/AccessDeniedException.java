package com.example.springproject.exception;

/**
 * Exception thrown when a user attempts to access a resource or perform an action
 * they don't have permission for.
 */
public class AccessDeniedException extends ApplicationException {
    
    public AccessDeniedException(String message) {
        super("ACCESS_DENIED", message);
    }
    
    public AccessDeniedException(String message, Throwable cause) {
        super("ACCESS_DENIED", message, cause);
    }
}
