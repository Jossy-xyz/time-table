package com.example.springproject.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "staffmc")
public class Staff {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "serial")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CollegeID", nullable = false)
    private Centre college;

    @Column(name = "StaffID", unique = true, length = 10)
    private String staffId;

    @Column(name = "Title", nullable = false, length = 10)
    private String title;

    @Column(name = "Surname", length = 20)
    private String surname;

    @Column(name = "FirstName", length = 20)
    private String firstname;

    @Column(name = "MiddleName", length = 20)
    private String middlename;

    @Column(name = "StatusID", columnDefinition = "tinyint UNSIGNED DEFAULT 1")
    private Integer statusId;

    @Column(name = "InUse", columnDefinition = "tinyint UNSIGNED DEFAULT 1")
    private Integer inUse;

    @Column(name = "DutyCount", columnDefinition = "smallint UNSIGNED DEFAULT 0")
    private Integer dutyCount;

    @Column(name = "ShortName", length = 30, nullable = false)
    private String shortName;
    
    // Note: removed fields not in staffmc schema to minimize refactor risk
    // specialization, research_area, discipline, serial_no are not in staffmc table

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Centre getCollege() {
        return college;
    }

    public void setCollege(Centre college) {
        this.college = college;
    }

    public String getStaffId() {
        return staffId;
    }

    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getMiddlename() {
        return middlename;
    }

    public void setMiddlename(String middlename) {
        this.middlename = middlename;
    }

    public Integer getStatusId() {
        return statusId;
    }

    public void setStatusId(Integer statusId) {
        this.statusId = statusId;
    }

    public Integer getInUse() {
        return inUse;
    }

    public void setInUse(Integer inUse) {
        this.inUse = inUse;
    }

    public Integer getDutyCount() {
        return dutyCount;
    }

    public void setDutyCount(Integer dutyCount) {
        this.dutyCount = dutyCount;
    }

    public String getShortName() {
        return shortName;
    }

    public void setShortName(String shortName) {
        this.shortName = shortName;
    }
}

