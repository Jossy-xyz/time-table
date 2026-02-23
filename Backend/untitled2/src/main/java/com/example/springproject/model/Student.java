package com.example.springproject.model;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "student")
public class Student {
    @Id
    @Column(name = "matricNo", length = 22)
    private String matricNo;

    @Column(name = "fulLname", length = 50)
    private String fullName;

    @Column(name = "Programme", nullable = false, length = 70)
    private String programme;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deptID")
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cenID", nullable = false)
    private Centre college;

    @Column(name = "DeptCode", nullable = false, length = 5)
    private String departmentCode;

    @Column(name = "level", columnDefinition = "smallint UNSIGNED")
    private Integer level;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    private List<Registration> courseRegistrations;

    public String getMatricNo() {
        return matricNo;
    }

    public void setMatricNo(String matricNo) {
        this.matricNo = matricNo;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getProgramme() {
        return programme;
    }

    public void setProgramme(String programme) {
        this.programme = programme;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
    }

    public Centre getCollege() {
        return college;
    }

    public void setCollege(Centre college) {
        this.college = college;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public List<Registration> getCourseRegistrations() {
        return courseRegistrations;
    }

    public void setCourseRegistrations(List<Registration> courseRegistrations) {
        this.courseRegistrations = courseRegistrations;
    }

    // Bridge method for legacy code expecting getId()
    @Transient
    public String getId() {
        return this.matricNo;
    }
}


