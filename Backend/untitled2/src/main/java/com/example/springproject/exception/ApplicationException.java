package com.example.springproject.exception;

/**
 * Base exception class for all application-specific exceptions.
 * Provides a consistent error code mechanism for client-side handling.
 */
public class ApplicationException extends RuntimeException {
    
    private final String errorCode;
    
    public ApplicationException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
    
    public ApplicationException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
}
