package com.example.springproject.dto;

import lombok.Data;

@Data
public class StudentSemesterRegistrationDto {
    private Long id;
    private String studentId; // Natural Key (matricNo)
    private String session;
    private Integer semester;
    private Integer level;
}
