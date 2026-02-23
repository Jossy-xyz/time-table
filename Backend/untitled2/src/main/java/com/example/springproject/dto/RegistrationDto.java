package com.example.springproject.dto;

import lombok.Data;

@Data
public class RegistrationDto {
    private Long id;
    private String studentId; // Natural Key (matricNo)
    private String courseId; // Natural Key (courseCode)
    private String session;
    private Integer semester;
}
