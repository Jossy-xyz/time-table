package com.example.springproject.dto;

import lombok.Data;

@Data
public class CourseDto {
    private Integer id;
    private String code;
    private String title;
    private Integer unit;
    private Integer semester;
    private Integer examType;
    private Integer enrollmentCount;
    private Integer lectureHours;
    private Integer tutorialHours;
    private Integer practicalHours;
    private Integer departmentId;
}
