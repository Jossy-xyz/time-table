package com.example.springproject.dto;

import java.time.LocalDate;
import java.util.List;

public class PeriodMappingResponse {
    private Integer totalPeriods;
    private Integer daysPerWeek;
    private Integer periodsPerDay;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<PeriodMapping> periods;
    
    // Constructors
    public PeriodMappingResponse() {}
    
    public PeriodMappingResponse(Integer totalPeriods, Integer daysPerWeek, 
                               Integer periodsPerDay, LocalDate startDate, 
                               LocalDate endDate, List<PeriodMapping> periods) {
        this.totalPeriods = totalPeriods;
        this.daysPerWeek = daysPerWeek;
        this.periodsPerDay = periodsPerDay;
        this.startDate = startDate;
        this.endDate = endDate;
        this.periods = periods;
    }
    
    // Getters and Setters
    public Integer getTotalPeriods() { return totalPeriods; }
    public void setTotalPeriods(Integer totalPeriods) { this.totalPeriods = totalPeriods; }
    
    public Integer getDaysPerWeek() { return daysPerWeek; }
    public void setDaysPerWeek(Integer daysPerWeek) { this.daysPerWeek = daysPerWeek; }
    
    public Integer getPeriodsPerDay() { return periodsPerDay; }
    public void setPeriodsPerDay(Integer periodsPerDay) { this.periodsPerDay = periodsPerDay; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public List<PeriodMapping> getPeriods() { return periods; }
    public void setPeriods(List<PeriodMapping> periods) { this.periods = periods; }
}
