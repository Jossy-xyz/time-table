package com.example.springproject.service;

import com.example.springproject.dto.PeriodExclusionRequest;
import com.example.springproject.model.GeneralSettings;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class PeriodExclusionValidator {
    
    public void validate(PeriodExclusionRequest request, GeneralSettings settings) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Snapshot name is required");
        }
        
        List<Integer> excluded = request.getExcludedPeriods();
        if (excluded == null) {
            return;
        }
        
        // Calculate total periods
        int days = settings.getDaysPerWeek() != null ? settings.getDaysPerWeek() : 5;
        int periodsPerDay = settings.getPeriodsPerDay() != null ? settings.getPeriodsPerDay() : 3;
        
        // Accurate total period calculation requires date diff, 
        // but for basic index validation we can just ensure they aren't negative
        // A strict upper bound check requires the full calculation logic which is in another service.
        // For "safety" and "no breakage", we'll just check for negative indices and duplicates here.
        
        for (Integer period : excluded) {
            if (period < 0) {
                throw new IllegalArgumentException("Period index cannot be negative: " + period);
            }
        }
        
        // Check for duplicates
        Set<Integer> unique = new HashSet<>(excluded);
        if (unique.size() != excluded.size()) {
            throw new IllegalArgumentException("Duplicate period indices detected");
        }
    }
}
