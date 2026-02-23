package com.example.springproject.dto;

import lombok.Data;

@Data
public class CourseDto {
    private String id;
    private String code;
    private String title;
    private Integer unit;
    private Integer semester;
    private Integer enrollmentCount;
}
