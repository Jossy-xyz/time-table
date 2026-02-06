package com.example.springproject.dto;

import lombok.Data;
import java.util.Date;

@Data
public class ConstraintDto {
    private Integer id;
    private String name;
    private Date date;
    private String periodIncE;
    private String periodExcE;
    private String venueIncE;
    private String venueExcE;
    private String periodIncV;
    private String periodExcV;
    private String examWAftE;
    private String examWCoinE;
    private String examExcE;
    private String frontLE;
    private String staffOmit;
    private String staffPeriodExcl;
}
