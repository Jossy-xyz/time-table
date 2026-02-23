package com.example.springproject.model;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "course")
public class Course {
    @Id
    @Column(name = "code", length = 15)
    private String code;

    @Column(name = "title", length = 40)
    private String title;

    @Column(name = "unit", columnDefinition = "tinyint UNSIGNED")
    private Integer unit;

    @Column(name = "semester", columnDefinition = "tinyint UNSIGNED")
    private Integer semester;

    @Column(name = "enCount", columnDefinition = "int UNSIGNED")
    private Integer enrollmentCount;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getUnit() {
        return unit;
    }

    public void setUnit(Integer unit) {
        this.unit = unit;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public Integer getEnrollmentCount() {
        return enrollmentCount;
    }

    public void setEnrollmentCount(Integer enrollmentCount) {
        this.enrollmentCount = enrollmentCount;
    }

    // Bridge method for legacy code expecting getId()
    @Transient
    public String getId() {
        return this.code;
    }
}
