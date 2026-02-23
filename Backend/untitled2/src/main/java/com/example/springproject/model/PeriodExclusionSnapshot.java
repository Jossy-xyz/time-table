package com.example.springproject.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "period_exclusion_snapshots")
public class PeriodExclusionSnapshot {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "general_settings_id", nullable = false)
    private GeneralSettings generalSettings;
    
    @Column(length = 255, nullable = false)
    private String name = "Untitled Snapshot";
    
    @Column(name = "excluded_periods", nullable = false, columnDefinition = "varchar(500)")
    private String excludedPeriods = "";
    
    @Column(name = "is_active", nullable = false)
    private Integer isActive = 0;
    
    @Column(name = "created_by", length = 100, nullable = false)
    private String createdBy = "system";
    
    @Column(name = "created_at", updatable = false, nullable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    // Constructors
    public PeriodExclusionSnapshot() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public GeneralSettings getGeneralSettings() {
        return generalSettings;
    }

    public void setGeneralSettings(GeneralSettings generalSettings) {
        this.generalSettings = generalSettings;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getIsActive() {
        return isActive;
    }

    public String getExcludedPeriods() {
        return excludedPeriods;
    }

    public void setExcludedPeriods(String excludedPeriods) {
        this.excludedPeriods = excludedPeriods;
    }

    public void setIsActive(Integer isActive) {
        this.isActive = isActive;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Helper: Parse CSV to List
    public List<Integer> getExcludedPeriodsList() {
        if (excludedPeriods == null || excludedPeriods.isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.stream(excludedPeriods.split(","))
                     .map(String::trim)
                     .filter(s -> !s.isEmpty())
                     .map(Integer::parseInt)
                     .collect(Collectors.toList());
    }
    
    // Helper: Convert List to CSV
    public void setExcludedPeriodsList(List<Integer> periods) {
        if (periods == null || periods.isEmpty()) {
            this.excludedPeriods = "";
            return;
        }
        this.excludedPeriods = periods.stream()
                                      .map(String::valueOf)
                                      .collect(Collectors.joining(","));
    }
}
