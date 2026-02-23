package com.example.springproject.dto;

import java.time.LocalDateTime;
import java.util.List;

public class PeriodExclusionDto {
    private Long id;
    private Long generalSettingsId;
    private String name;
    private List<Integer> excludedPeriods;
    private Boolean isActive;
    private String createdBy;
    private LocalDateTime createdAt;
    
    // Constructors
    public PeriodExclusionDto() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getGeneralSettingsId() { return generalSettingsId; }
    public void setGeneralSettingsId(Long generalSettingsId) { this.generalSettingsId = generalSettingsId; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public List<Integer> getExcludedPeriods() { return excludedPeriods; }
    public void setExcludedPeriods(List<Integer> excludedPeriods) { this.excludedPeriods = excludedPeriods; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
