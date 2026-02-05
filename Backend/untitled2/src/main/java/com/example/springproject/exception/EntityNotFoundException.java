package com.example.springproject.exception;

/**
 * Exception thrown when a requested entity is not found in the database.
 */
public class EntityNotFoundException extends ApplicationException {
    
    public EntityNotFoundException(String entityName, Object id) {
        super("NOT_FOUND", entityName + " with ID " + id + " not found");
    }
    
    public EntityNotFoundException(String message) {
        super("NOT_FOUND", message);
    }
}
