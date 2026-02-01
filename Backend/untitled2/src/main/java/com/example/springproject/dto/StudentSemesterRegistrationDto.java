package com.example.springproject.dto;

import lombok.Data;

@Data
public class StudentSemesterRegistrationDto {
    private Long id;
    private Integer studentId;
    private String session;
    private Integer semester;
    private Integer level;
}
