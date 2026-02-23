package com.example.springproject.dto;

import lombok.Data;

@Data
public class StaffDto {
    private Integer id;
    private String staffId;
    private String title;
    private String surname;
    private String firstname;
    private String middlename;
    private Integer statusId;
    private Boolean inUse;
    private Integer dutyCount;
    private Integer collegeId;
}
