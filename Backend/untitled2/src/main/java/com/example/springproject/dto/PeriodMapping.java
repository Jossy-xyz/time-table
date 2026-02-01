package com.example.springproject.dto;

import java.time.LocalDate;

public class PeriodMapping {
    private Integer periodIndex;      // 0-based (backend)
    private Integer displayIndex;     // 1-based (frontend)
    private LocalDate date;
    private String dayOfWeek;
    private Integer weekNumber;
    private Integer periodOfDay;
    
    // Constructors
    public PeriodMapping() {}
    
    // Getters and Setters
    public Integer getPeriodIndex() { return periodIndex; }
    public void setPeriodIndex(Integer periodIndex) { this.periodIndex = periodIndex; }
    
    public Integer getDisplayIndex() { return displayIndex; }
    public void setDisplayIndex(Integer displayIndex) { this.displayIndex = displayIndex; }
    
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    
    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
    
    public Integer getWeekNumber() { return weekNumber; }
    public void setWeekNumber(Integer weekNumber) { this.weekNumber = weekNumber; }
    
    public Integer getPeriodOfDay() { return periodOfDay; }
    public void setPeriodOfDay(Integer periodOfDay) { this.periodOfDay = periodOfDay; }
}
