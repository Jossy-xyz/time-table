package com.example.springproject.dto;

import lombok.Data;

@Data
public class DepartmentDto {
    private Integer id;
    private String code;
    private String name;
    private Integer centreId;
}
