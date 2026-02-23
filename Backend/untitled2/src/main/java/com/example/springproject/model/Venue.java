package com.example.springproject.model;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "venue")
public class Venue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cenID")
    private Centre centre;

    @Column(name = "vCode", unique = true, nullable = false, length = 13)
    private String venueCode;

    @Column(name = "Name", length = 40)
    private String name;

    @Column(name = "Capacity", columnDefinition = "smallint UNSIGNED")
    private Integer capacity;

    @Column(name = "Type", columnDefinition = "tinyint UNSIGNED")
    private Integer type;

    @Column(name = "Preference", nullable = false, columnDefinition = "smallint UNSIGNED DEFAULT 0")
    private Integer preference;

    @Column(name = "actualcap", columnDefinition = "smallint UNSIGNED")
    private Integer actualCapacity;

    @Column(name = "InUse", nullable = false, columnDefinition = "tinyint UNSIGNED DEFAULT 1")
    private Integer inUse;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Centre getCentre() {
        return centre;
    }

    public void setCentre(Centre centre) {
        this.centre = centre;
    }

    public String getVenueCode() {
        return venueCode;
    }

    public void setVenueCode(String venueCode) {
        this.venueCode = venueCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public Integer getType() {
        return type;
    }

    public void setType(Integer type) {
        this.type = type;
    }

    public Integer getPreference() {
        return preference;
    }

    public void setPreference(Integer preference) {
        this.preference = preference;
    }

    public Integer getActualCapacity() {
        return actualCapacity;
    }

    public void setActualCapacity(Integer actualCapacity) {
        this.actualCapacity = actualCapacity;
    }

    public Integer getInUse() {
        return inUse;
    }

    public void setInUse(Integer inUse) {
        this.inUse = inUse;
    }
}
