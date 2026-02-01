package com.example.springproject.dto;

import lombok.Data;

@Data
public class ProgramDto {
    private Integer id;
    private Integer departmentId;
    private String code;
    private String name;
    private Integer duration;
    private Integer totalCompulsoryUnits;
    private Integer totalRequiredUnits;
    private Integer minElectiveUnits;
    private String entryRequirements;
}
