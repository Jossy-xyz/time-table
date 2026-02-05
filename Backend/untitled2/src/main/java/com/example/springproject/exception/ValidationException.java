package com.example.springproject.exception;

import java.util.Map;
import java.util.HashMap;

/**
 * Exception thrown when input validation fails.
 * Contains a map of field names to error messages.
 */
public class ValidationException extends ApplicationException {
    
    private final Map<String, String> errors;
    
    public ValidationException(Map<String, String> errors) {
        super("VALIDATION_ERROR", "Validation failed");
        this.errors = errors != null ? errors : new HashMap<>();
    }
    
    public ValidationException(String field, String message) {
        super("VALIDATION_ERROR", "Validation failed");
        this.errors = new HashMap<>();
        this.errors.put(field, message);
    }
    
    public ValidationException(String message) {
        super("VALIDATION_ERROR", message);
        this.errors = new HashMap<>();
    }
    
    public Map<String, String> getErrors() {
        return errors;
    }
}
