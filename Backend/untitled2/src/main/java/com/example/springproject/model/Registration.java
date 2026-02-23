package com.example.springproject.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "registration")
public class Registration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "regIDMC")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "centreID", nullable = false)
    private Centre college;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matricNo", referencedColumnName = "matricNo", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "courseCode", referencedColumnName = "code", nullable = false)
    private Course course;

    @Column(name = "ID", nullable = false, columnDefinition = "int UNSIGNED")
    private Integer internalReferenceId;

    @Column(name = "session", length = 9)
    private String session;

    @Column(name = "semester", columnDefinition = "tinyint UNSIGNED")
    private Integer semester;

    @Column(name = "level", columnDefinition = "smallint UNSIGNED")
    private Integer level;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Centre getCollege() {
        return college;
    }

    public void setCollege(Centre college) {
        this.college = college;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public Integer getInternalReferenceId() {
        return internalReferenceId;
    }

    public void setInternalReferenceId(Integer internalReferenceId) {
        this.internalReferenceId = internalReferenceId;
    }

    public String getSession() {
        return session;
    }

    public void setSession(String session) {
        this.session = session;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }
}
