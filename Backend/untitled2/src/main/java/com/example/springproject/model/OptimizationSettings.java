package com.example.springproject.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "optimization_settings")
public class OptimizationSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "display_progress")
    private Boolean displayProgress;

    @Column(name = "opt_time")
    private String optTime;

    @Column(name = "opt_cycle_count")
    private Integer optCycleCount;

    @Column(name = "exam_weight_time")
    private Boolean examWeightTime;

    @Column(name = "exam_weight_cycle")
    private Boolean examWeightCycle;

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Boolean getDisplayProgress() {
        return displayProgress;
    }

    public void setDisplayProgress(Boolean displayProgress) {
        this.displayProgress = displayProgress;
    }

    public String getOptTime() {
        return optTime;
    }

    public void setOptTime(String optTime) {
        this.optTime = optTime;
    }

    public Integer getOptCycleCount() {
        return optCycleCount;
    }

    public void setOptCycleCount(Integer optCycleCount) {
        this.optCycleCount = optCycleCount;
    }

    public Boolean getExamWeightTime() {
        return examWeightTime;
    }

    public void setExamWeightTime(Boolean examWeightTime) {
        this.examWeightTime = examWeightTime;
    }

    public Boolean getExamWeightCycle() {
        return examWeightCycle;
    }

    public void setExamWeightCycle(Boolean examWeightCycle) {
        this.examWeightCycle = examWeightCycle;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}
