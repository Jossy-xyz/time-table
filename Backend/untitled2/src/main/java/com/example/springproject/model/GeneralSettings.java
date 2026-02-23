package com.example.springproject.model;
// Refactor: Persisted config expansion

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "general_settings")
public class GeneralSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "description")
    private String description;

    @Column(name = "days_per_week", nullable = false)
    private Integer daysPerWeek = 5;

    @Column(name = "periods_per_day", nullable = false)
    private Integer periodsPerDay = 3;

    @Column(length = 50)
    private Integer semester;

    @Column(length = 50)
    private String session;

    @Column(name = "start_date")
    @Temporal(TemporalType.DATE)
    private Date startDate;

    @Column(name = "end_date")
    @Temporal(TemporalType.DATE)
    private Date endDate;

    @Column(name = "exam_category")
    private Integer examCategory;

    @Column(name = "campus_type")
    private Integer campusType;

    @Column(name = "exam_level", length = 100)
    private String examLevel = "100,200,300,400,500"; // Specific levels (e.g. 100,200)

    @Column(name = "exam_weeks")
    private Integer examWeeks = 2;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getDaysPerWeek() { return daysPerWeek; }
    public void setDaysPerWeek(Integer daysPerWeek) { this.daysPerWeek = daysPerWeek; }

    public Integer getPeriodsPerDay() { return periodsPerDay; }
    public void setPeriodsPerDay(Integer periodsPerDay) { this.periodsPerDay = periodsPerDay; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getSession() { return session; }
    public void setSession(String session) { this.session = session; }

    public Date getStartDate() { return startDate; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }

    public Date getEndDate() { return endDate; }
    public void setEndDate(Date endDate) { this.endDate = endDate; }

    public Integer getExamCategory() { return examCategory; }
    public void setExamCategory(Integer examCategory) { this.examCategory = examCategory; }

    public Integer getCampusType() { return campusType; }
    public void setCampusType(Integer campusType) { this.campusType = campusType; }

    public String getExamLevel() { return examLevel; }
    public void setExamLevel(String examLevel) { this.examLevel = examLevel; }

    public Integer getExamWeeks() { return examWeeks; }
    public void setExamWeeks(Integer examWeeks) { this.examWeeks = examWeeks; }
}

