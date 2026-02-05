package com.example.springproject.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "output_tab")
public class OutputSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "mix_exams")
    private Boolean mixExams;

    @Column(name = "more_space")
    private Boolean moreSpace;

    @Column(name = "le_fullyinV")
    private Boolean leFullyInV;

    @Column(name = "saveTT_csv")
    private Boolean saveTtCsv;

    @Column(name = "saveTT_pdf")
    private Boolean saveTtPdf;

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

    public Boolean getMixExams() {
        return mixExams;
    }

    public void setMixExams(Boolean mixExams) {
        this.mixExams = mixExams;
    }

    public Boolean getMoreSpace() {
        return moreSpace;
    }

    public void setMoreSpace(Boolean moreSpace) {
        this.moreSpace = moreSpace;
    }

    public Boolean getLeFullyInV() {
        return leFullyInV;
    }

    public void setLeFullyInV(Boolean leFullyInV) {
        this.leFullyInV = leFullyInV;
    }

    public Boolean getSaveTtCsv() {
        return saveTtCsv;
    }

    public void setSaveTtCsv(Boolean saveTtCsv) {
        this.saveTtCsv = saveTtCsv;
    }

    public Boolean getSaveTtPdf() {
        return saveTtPdf;
    }

    public void setSaveTtPdf(Boolean saveTtPdf) {
        this.saveTtPdf = saveTtPdf;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}
