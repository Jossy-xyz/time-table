package com.example.springproject.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "examtab")
public class Examtab {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "schedule_policy")
    private Integer schedulePolicy;

    @Column(name = "max_examl", columnDefinition = "INT DEFAULT 0")
    private Integer maxExaml;

    @Column(name = "min_examl", columnDefinition = "INT DEFAULT 0")
    private Integer minExaml;

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getSchedulePolicy() {
        return schedulePolicy;
    }

    public void setSchedulePolicy(Integer schedulePolicy) {
        this.schedulePolicy = schedulePolicy;
    }

    public Integer getMaxExaml() {
        return maxExaml;
    }

    public void setMaxExaml(Integer maxExaml) {
        this.maxExaml = maxExaml;
    }

    public Integer getMinExaml() {
        return minExaml;
    }

    public void setMinExaml(Integer minExaml) {
        this.minExaml = minExaml;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}
