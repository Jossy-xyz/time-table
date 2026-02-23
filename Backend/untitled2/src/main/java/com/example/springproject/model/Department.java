package com.example.springproject.model;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "department")
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CollegeID", nullable = false)
    private Centre centre;

    @Column(name = "Code", unique = true, length = 5)
    private String code;

    @Column(name = "Name", nullable = false, length = 60)
    private String name;

    @Column(name = "HODID", columnDefinition = "int UNSIGNED")
    private Integer headOfDepartmentId;

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Program> programs;

    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY)
    private List<Student> students;

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

    public Integer getHeadOfDepartmentId() {
        return headOfDepartmentId;
    }

    public void setHeadOfDepartmentId(Integer headOfDepartmentId) {
        this.headOfDepartmentId = headOfDepartmentId;
    }

    public List<Program> getPrograms() {
        return programs;
    }

    public void setPrograms(List<Program> programs) {
        this.programs = programs;
    }

    public List<Student> getStudents() {
        return students;
    }

    public void setStudents(List<Student> students) {
        this.students = students;
    }
}
