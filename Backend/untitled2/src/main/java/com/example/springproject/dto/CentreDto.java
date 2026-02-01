package com.example.springproject.dto;

import lombok.Data;
import java.util.Date;

@Data
public class CentreDto {
    private Integer id;
    private String code;
    private String name;
    private Integer type;
    private String state;
}
