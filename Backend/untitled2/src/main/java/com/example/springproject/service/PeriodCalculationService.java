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
        
        List<PeriodMapping> periods = new ArrayList<>();
        int periodIndex = 0;
        LocalDate currentDate = startDate;
        int weekNumber = 1;
        int dayInWeek = 0;
        
        while (!currentDate.isAfter(endDate)) {
            // Generate periods for this day
            for (int periodOfDay = 1; periodOfDay <= periodsPerDay; periodOfDay++) {
                PeriodMapping mapping = new PeriodMapping();
                mapping.setPeriodIndex(periodIndex);
                mapping.setDisplayIndex(periodIndex + 1);
                mapping.setDate(currentDate);
                mapping.setDayOfWeek(currentDate.getDayOfWeek().toString());
                mapping.setWeekNumber(weekNumber);
                mapping.setPeriodOfDay(periodOfDay);
                
                periods.add(mapping);
                periodIndex++;
            }
            
            // Check if we've completed a week (Sunday is end of week)
            if (currentDate.getDayOfWeek() == java.time.DayOfWeek.SUNDAY) {
                weekNumber++;
            }

            // Move to next day
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
        if (dateToConvert instanceof java.sql.Date) {
            return ((java.sql.Date) dateToConvert).toLocalDate();
        } else if (dateToConvert instanceof java.sql.Timestamp) {
            return ((java.sql.Timestamp) dateToConvert).toLocalDateTime().toLocalDate();
        }
        return dateToConvert.toInstant()
            .atZone(ZoneId.systemDefault())
            .toLocalDate();
    }
}
