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
    private String semester;

    @Column(length = 50)
    private String session;

    @Column(name = "start_date")
    @Temporal(TemporalType.DATE)
    private Date startDate;

    @Column(name = "end_date")
    @Temporal(TemporalType.DATE)
    private Date endDate;

    @Column(name = "exam_category", length = 50)
    private String examCategory = "Regular"; // Regular, TopUp, Part-Time, Online

    @Column(name = "campus_type", length = 50)
    private String campusType = "Single"; // Single or Multi

    @Column(name = "exam_level", length = 100)
    private String examLevel = "All"; // All or specific levels (e.g. 100,200)

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

    public String getSemester() { return semester; }
    public void setSemester(String semester) { this.semester = semester; }

    public String getSession() { return session; }
    public void setSession(String session) { this.session = session; }

    public Date getStartDate() { return startDate; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }

    public Date getEndDate() { return endDate; }
    public void setEndDate(Date endDate) { this.endDate = endDate; }

    public String getExamCategory() { return examCategory; }
    public void setExamCategory(String examCategory) { this.examCategory = examCategory; }

    public String getCampusType() { return campusType; }
    public void setCampusType(String campusType) { this.campusType = campusType; }

    public String getExamLevel() { return examLevel; }
    public void setExamLevel(String examLevel) { this.examLevel = examLevel; }

    public Integer getExamWeeks() { return examWeeks; }
    public void setExamWeeks(Integer examWeeks) { this.examWeeks = examWeeks; }
}

