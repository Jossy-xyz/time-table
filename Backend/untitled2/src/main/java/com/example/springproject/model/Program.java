package com.example.springproject.model;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "program")
public class Program {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "INT DEFAULT 4")
    private Integer duration;

    @Column(name = "total_comp_units", columnDefinition = "INT DEFAULT 0")
    private Integer totalCompulsoryUnits;

    @Column(name = "total_req_units", columnDefinition = "INT DEFAULT 0")
    private Integer totalRequiredUnits;

    @Column(name = "min_elective_units", columnDefinition = "INT DEFAULT 0")
    private Integer minElectiveUnits;

    @Column(name = "entry_req", columnDefinition = "TEXT")
    private String entryRequirements;

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL)
    private List<Student> students;

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

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Integer getTotalCompulsoryUnits() {
        return totalCompulsoryUnits;
    }

    public void setTotalCompulsoryUnits(Integer totalCompulsoryUnits) {
        this.totalCompulsoryUnits = totalCompulsoryUnits;
    }

    public Integer getTotalRequiredUnits() {
        return totalRequiredUnits;
    }

    public void setTotalRequiredUnits(Integer totalRequiredUnits) {
        this.totalRequiredUnits = totalRequiredUnits;
    }

    public Integer getMinElectiveUnits() {
        return minElectiveUnits;
    }

    public void setMinElectiveUnits(Integer minElectiveUnits) {
        this.minElectiveUnits = minElectiveUnits;
    }

    public String getEntryRequirements() {
        return entryRequirements;
    }

    public void setEntryRequirements(String entryRequirements) {
        this.entryRequirements = entryRequirements;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public List<Student> getStudents() {
        return students;
    }

    public void setStudents(List<Student> students) {
        this.students = students;
    }
}
