package com.example.springproject.service;

import com.example.springproject.dto.PeriodMapping;
import com.example.springproject.dto.PeriodMappingResponse;
import com.example.springproject.model.GeneralSettings;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class PeriodCalculationService {
    
    public PeriodMappingResponse calculatePeriodMapping(GeneralSettings settings) {
        if (settings == null || settings.getStartDate() == null || settings.getEndDate() == null) {
            return new PeriodMappingResponse();
        }

        LocalDate startDate = convertToLocalDate(settings.getStartDate());
        LocalDate endDate = convertToLocalDate(settings.getEndDate());
        int daysPerWeek = settings.getDaysPerWeek() != null ? settings.getDaysPerWeek() : 5;
        int periodsPerDay = settings.getPeriodsPerDay() != null ? settings.getPeriodsPerDay() : 3;
        
        // MONDAY ANCHOR LOGIC
        LocalDate anchorDate = startDate;
        while (anchorDate.getDayOfWeek() != java.time.DayOfWeek.MONDAY) {
            anchorDate = anchorDate.minusDays(1);
        }

        List<PeriodMapping> periods = new ArrayList<>();
        int periodIndex = 0;
        LocalDate currentDate = anchorDate; // Start generation from Anchor Monday
        int weekNumber = 1;
        
        // Generate a 7-day matrix backbone for each week processed
        // Continue loop until we cover the entire date range AND we finish the final week (reached next Monday)
        while (!currentDate.isAfter(endDate) || currentDate.getDayOfWeek() != java.time.DayOfWeek.MONDAY) {
            boolean isLocked = currentDate.isBefore(startDate) || currentDate.isAfter(endDate);
            // DEBUG: Log locking logic
            // System.out.println("Date: " + currentDate + " Start: " + startDate + " Locked: " + isLocked);
            
            // Generate periods for this day
            for (int periodOfDay = 1; periodOfDay <= periodsPerDay; periodOfDay++) {
                PeriodMapping mapping = new PeriodMapping();
                mapping.setPeriodIndex(periodIndex);
                mapping.setDisplayIndex(periodIndex + 1);
                mapping.setDate(currentDate);
                mapping.setDayOfWeek(currentDate.getDayOfWeek().toString());
                mapping.setWeekNumber(weekNumber);
                mapping.setPeriodOfDay(periodOfDay);
                mapping.setIsSystemLocked(isLocked);
                
                periods.add(mapping);
                periodIndex++;
            }
            
            // Week boundary (Sunday marks transition to next week index)
            if (currentDate.getDayOfWeek() == java.time.DayOfWeek.SUNDAY) {
                weekNumber++;
            }

            // Iterate to next day
            currentDate = currentDate.plusDays(1);
        }
        
        return new PeriodMappingResponse(
            periodIndex,  // totalPeriods
            daysPerWeek,
            periodsPerDay,
            startDate,
            endDate,
            periods
        );
    }

    private LocalDate convertToLocalDate(Date dateToConvert) {
        if (dateToConvert == null) {
            return LocalDate.now();
        }
        
        // Robust conversion preserving face-value date components
        // distinct from Instant/Timezone shifts
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.setTime(dateToConvert);
        
        return LocalDate.of(
            cal.get(java.util.Calendar.YEAR), 
            cal.get(java.util.Calendar.MONTH) + 1, 
            cal.get(java.util.Calendar.DAY_OF_MONTH)
        );
    }
}
