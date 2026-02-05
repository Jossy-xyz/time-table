package com.example.springproject.dto;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standardized error response DTO for all API errors.
 * Provides consistent error format across the application.
 */
public class ErrorResponse {
    
    private String errorCode;
    private String message;
    private Map<String, String> details;
    private LocalDateTime timestamp;
    private String path;
    
    public ErrorResponse() {
        this.timestamp = LocalDateTime.now();
    }
    
    public ErrorResponse(String errorCode, String message) {
        this();
        this.errorCode = errorCode;
        this.message = message;
    }
    
    public ErrorResponse(String errorCode, String message, Map<String, String> details) {
        this(errorCode, message);
        this.details = details;
    }
    
    public ErrorResponse(String errorCode, String message, String path) {
        this(errorCode, message);
        this.path = path;
    }
    
    // Getters and Setters
    public String getErrorCode() {
        return errorCode;
    }
    
    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Map<String, String> getDetails() {
        return details;
    }
    
    public void setDetails(Map<String, String> details) {
        this.details = details;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public String getPath() {
        return path;
    }
    
    public void setPath(String path) {
        this.path = path;
    }
}
