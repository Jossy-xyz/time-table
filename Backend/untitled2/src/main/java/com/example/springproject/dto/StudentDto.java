package com.example.springproject.dto;

import lombok.Data;
import java.util.Date;

@Data
public class StudentDto {
    private Integer id;
    private String matricNo;
    private String surname;
    private String firstname;
    private String middlename;
    private Integer level;
    private String gender;
    private String startSession;
    private Integer departmentId;
    private Integer programId;
    private String programmeName;
}
