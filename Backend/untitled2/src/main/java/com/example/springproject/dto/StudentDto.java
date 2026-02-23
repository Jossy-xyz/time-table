package com.example.springproject.dto;

import lombok.Data;

@Data
public class StudentDto {
    private String id; // Natural Key (matricNo)
    private String matricNo;
    private String fullName;
    private Integer level;
    private Integer departmentId;
    private Integer collegeId;
    private String programme;
}
