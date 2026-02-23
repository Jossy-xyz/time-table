package com.example.springproject.dto;

import lombok.Data;

@Data
public class VenueDto {
    private Integer id;
    private Integer centreId;
    private String venueCode;
    private String name;
    private Integer capacity;
    private Integer type;
    private Integer preference;
    private Integer actualCapacity;
    private Integer inUse;
}
