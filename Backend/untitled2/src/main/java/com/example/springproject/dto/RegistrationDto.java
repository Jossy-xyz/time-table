package com.example.springproject.dto;

import lombok.Data;

@Data
public class RegistrationDto {
    private Long id;
    private Integer studentId;
    private Integer courseId;
    private String session;
    private Integer semester;
}
