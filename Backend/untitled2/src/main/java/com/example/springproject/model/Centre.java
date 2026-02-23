package com.example.springproject.model;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "centre")
public class Centre {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "Code", unique = true, nullable = false, length = 10)
    private String code;

    @Column(name = "name", length = 120)
    private String name;

    @Column(name = "type", columnDefinition = "tinyint UNSIGNED")
    private Integer type;

    @Column(name = "state", length = 20)
    private String state;

    @Column(name = "enCount", columnDefinition = "int UNSIGNED")
    private Integer enrollmentCount;

    @Column(name = "totalVCap", columnDefinition = "int UNSIGNED")
    private Integer totalVenueCapacity;

    @Column(name = "zoneCount", nullable = false, columnDefinition = "tinyint UNSIGNED DEFAULT 0")
    private Integer zoneCount;

    @OneToMany(mappedBy = "centre", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Department> departments;

    @OneToMany(mappedBy = "centre", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Venue> venues;

    @OneToMany(mappedBy = "college", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Staff> staffMembers;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getType() {
        return type;
    }

    public void setType(Integer type) {
        this.type = type;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public Integer getEnrollmentCount() {
        return enrollmentCount;
    }

    public void setEnrollmentCount(Integer enrollmentCount) {
        this.enrollmentCount = enrollmentCount;
    }

    public Integer getTotalVenueCapacity() {
        return totalVenueCapacity;
    }

    public void setTotalVenueCapacity(Integer totalVenueCapacity) {
        this.totalVenueCapacity = totalVenueCapacity;
    }

    public Integer getZoneCount() {
        return zoneCount;
    }

    public void setZoneCount(Integer zoneCount) {
        this.zoneCount = zoneCount;
    }

    public List<Department> getDepartments() {
        return departments;
    }

    public void setDepartments(List<Department> departments) {
        this.departments = departments;
    }

    public List<Venue> getVenues() {
        return venues;
    }

    public void setVenues(List<Venue> venues) {
        this.venues = venues;
    }

    public List<Staff> getStaffMembers() {
        return staffMembers;
    }

    public void setStaffMembers(List<Staff> staffMembers) {
        this.staffMembers = staffMembers;
    }
}
