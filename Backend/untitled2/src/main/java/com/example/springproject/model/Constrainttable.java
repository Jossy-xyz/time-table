package com.example.springproject.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "constraint_table")
public class Constrainttable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name", length = 255)
    private String name = "Untitled Snapshot";

    @Column(name = "description")
    private String description;

    @Column(name = "record_date", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date recordDate;

    @Column(name = "period_inc_e")
    private String periodIncE;

    @Column(name = "period_exc_e")
    private String periodExcE;

    @Column(name = "venue_inc_e")
    private String venueIncE;

    @Column(name = "venue_exc_e")
    private String venueExcE;

    @Column(name = "period_inc_v")
    private String periodIncV;

    @Column(name = "period_exc_v")
    private String periodExcV;

    @Column(name = "exam_w_aft_e")
    private String examWAftE;

    @Column(name = "exam_w_coin_e")
    private String examWCoinE;

    @Column(name = "exam_exc_e")
    private String examExcE;

    @Column(name = "front_l_e")
    private String frontLE;

    @Column(name = "staff_omit")
    private String staffOmit;

    @Column(name = "staff_period_excl")
    private String staffPeriodExcl;

    @PrePersist
    protected void onCreate() {
        if (recordDate == null) recordDate = new Date();
    }

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Date getRecordDate() {
        return recordDate;
    }

    public void setRecordDate(Date recordDate) {
        this.recordDate = recordDate;
    }

    public String getPeriodIncE() {
        return periodIncE;
    }

    public void setPeriodIncE(String periodIncE) {
        this.periodIncE = periodIncE;
    }

    public String getPeriodExcE() {
        return periodExcE;
    }

    public void setPeriodExcE(String periodExcE) {
        this.periodExcE = periodExcE;
    }

    public String getVenueIncE() {
        return venueIncE;
    }

    public void setVenueIncE(String venueIncE) {
        this.venueIncE = venueIncE;
    }

    public String getVenueExcE() {
        return venueExcE;
    }

    public void setVenueExcE(String venueExcE) {
        this.venueExcE = venueExcE;
    }

    public String getPeriodIncV() {
        return periodIncV;
    }

    public void setPeriodIncV(String periodIncV) {
        this.periodIncV = periodIncV;
    }

    public String getPeriodExcV() {
        return periodExcV;
    }

    public void setPeriodExcV(String periodExcV) {
        this.periodExcV = periodExcV;
    }

    public String getExamWAftE() {
        return examWAftE;
    }

    public void setExamWAftE(String examWAftE) {
        this.examWAftE = examWAftE;
    }

    public String getExamWCoinE() {
        return examWCoinE;
    }

    public void setExamWCoinE(String examWCoinE) {
        this.examWCoinE = examWCoinE;
    }

    public String getExamExcE() {
        return examExcE;
    }

    public void setExamExcE(String examExcE) {
        this.examExcE = examExcE;
    }

    public String getFrontLE() {
        return frontLE;
    }

    public void setFrontLE(String frontLE) {
        this.frontLE = frontLE;
    }

    public String getStaffOmit() {
        return staffOmit;
    }

    public void setStaffOmit(String staffOmit) {
        this.staffOmit = staffOmit;
    }

    public String getStaffPeriodExcl() {
        return staffPeriodExcl;
    }

    public void setStaffPeriodExcl(String staffPeriodExcl) {
        this.staffPeriodExcl = staffPeriodExcl;
    }
}
