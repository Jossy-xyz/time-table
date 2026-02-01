package com.example.springproject.dto;

import lombok.Data;

@Data
public class UserDto {
    private Integer id;
    private String username;
    private Integer roleId;
    private String roleCode;
    private Integer collegeId;
    private Integer departmentId;
    private Integer staffId;
    private String email;
}
