package com.example.springproject.dto;

import java.util.List;

public class PeriodExclusionRequest {
    private String name;
    private List<Integer> excludedPeriods;
    private Boolean setAsActive;
    
    // Constructors
    public PeriodExclusionRequest() {}
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public List<Integer> getExcludedPeriods() { return excludedPeriods; }
    public void setExcludedPeriods(List<Integer> excludedPeriods) { this.excludedPeriods = excludedPeriods; }
    
    public Boolean getSetAsActive() { return setAsActive; }
    public void setSetAsActive(Boolean setAsActive) { this.setAsActive = setAsActive; }
}
