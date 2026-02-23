package com.example.springproject.model;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "program")
public class Program {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "Name", nullable = false, length = 60)
    private String name;

    @Column(name = "code", length = 60)
    private String code;

    @Column(name = "NameCode", length = 80)
    private String nameCode;

    @Column(name = "Duration", columnDefinition = "tinyint UNSIGNED")
    private Integer duration;

    @Column(name = "TCompU", columnDefinition = "smallint UNSIGNED")
    private Integer totalCompulsoryUnits;

    @Column(name = "TReqU", columnDefinition = "smallint UNSIGNED")
    private Integer totalRequiredUnits;

    @Column(name = "MinEU", columnDefinition = "smallint UNSIGNED")
    private Integer minElectiveUnits;

    @Column(name = "EntryReq", columnDefinition = "text")
    private String entryRequirements;

    @Column(name = "newCodeID", columnDefinition = "tinyint UNSIGNED")
    private Integer newCodeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DeptID")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CollegeID")
    private Centre centre;

    @Column(name = "CoordID", columnDefinition = "int UNSIGNED")
    private Integer coordinatorId;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getNameCode() {
        return nameCode;
    }

    public void setNameCode(String nameCode) {
        this.nameCode = nameCode;
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

    public Integer getNewCodeId() {
        return newCodeId;
    }

    public void setNewCodeId(Integer newCodeId) {
        this.newCodeId = newCodeId;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public Centre getCentre() {
        return centre;
    }

    public void setCentre(Centre centre) {
        this.centre = centre;
    }

    public Integer getCoordinatorId() {
        return coordinatorId;
    }

    public void setCoordinatorId(Integer coordinatorId) {
        this.coordinatorId = coordinatorId;
    }
}
