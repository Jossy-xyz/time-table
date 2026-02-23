package com.example.springproject.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "output_tab")
public class OutputSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "invigilator_ratio")
    private Integer invigilatorRatio;

    @Column(name = "invigilator_special_ratio")
    private Integer invigilatorSpecialRatio;

    @Column(name = "venue_alg")
    private Integer venueAlg;

    @Column(name = "venue_alg_order")
    private Integer venueAlgOrder;

    @Column(name = "mix_exams")
    private Integer mixExams;

    @Column(name = "more_space")
    private Integer moreSpace;

    @Column(name = "le_fullyinV")
    private Integer leFullyInV;

    @Column(name = "use_half_venue")
    private Integer useHalfVenue;

    @Column(name = "select_staff_random")
    private Integer selectStaffRandom;

    @Column(name = "use_staff_ids")
    private Integer useStaffIds;

    @Column(name = "update_staff_duty")
    private Integer updateStaffDuty;

    @Column(name = "skip_week")
    private Integer skipWeek;

    @Column(name = "gen_sitting_arr")
    private Integer genSittingArr;

    @Column(name = "save_file")
    private Integer saveFile;

    @Column(name = "save_to_db")
    private Integer saveToDb;

    @Column(name = "created_at", updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }

    // Getters and Setters

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getInvigilatorRatio() { return invigilatorRatio; }
    public void setInvigilatorRatio(Integer invigilatorRatio) { this.invigilatorRatio = invigilatorRatio; }

    public Integer getInvigilatorSpecialRatio() { return invigilatorSpecialRatio; }
    public void setInvigilatorSpecialRatio(Integer invigilatorSpecialRatio) { this.invigilatorSpecialRatio = invigilatorSpecialRatio; }

    public Integer getVenueAlg() { return venueAlg; }
    public void setVenueAlg(Integer venueAlg) { this.venueAlg = venueAlg; }

    public Integer getVenueAlgOrder() { return venueAlgOrder; }
    public void setVenueAlgOrder(Integer venueAlgOrder) { this.venueAlgOrder = venueAlgOrder; }

    public Integer getMixExams() { return mixExams; }
    public void setMixExams(Integer mixExams) { this.mixExams = mixExams; }

    public Integer getMoreSpace() { return moreSpace; }
    public void setMoreSpace(Integer moreSpace) { this.moreSpace = moreSpace; }

    public Integer getLeFullyInV() { return leFullyInV; }
    public void setLeFullyInV(Integer leFullyInV) { this.leFullyInV = leFullyInV; }

    public Integer getUseHalfVenue() { return useHalfVenue; }
    public void setUseHalfVenue(Integer useHalfVenue) { this.useHalfVenue = useHalfVenue; }

    public Integer getSelectStaffRandom() { return selectStaffRandom; }
    public void setSelectStaffRandom(Integer selectStaffRandom) { this.selectStaffRandom = selectStaffRandom; }

    public Integer getUseStaffIds() { return useStaffIds; }
    public void setUseStaffIds(Integer useStaffIds) { this.useStaffIds = useStaffIds; }

    public Integer getUpdateStaffDuty() { return updateStaffDuty; }
    public void setUpdateStaffDuty(Integer updateStaffDuty) { this.updateStaffDuty = updateStaffDuty; }

    public Integer getSkipWeek() { return skipWeek; }
    public void setSkipWeek(Integer skipWeek) { this.skipWeek = skipWeek; }

    public Integer getGenSittingArr() { return genSittingArr; }
    public void setGenSittingArr(Integer genSittingArr) { this.genSittingArr = genSittingArr; }

    public Integer getSaveFile() { return saveFile; }
    public void setSaveFile(Integer saveFile) { this.saveFile = saveFile; }

    public Integer getSaveToDb() { return saveToDb; }
    public void setSaveToDb(Integer saveToDb) { this.saveToDb = saveToDb; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}
