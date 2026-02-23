package com.example.springproject.controller;

import com.example.springproject.dto.VenueDto;
import com.example.springproject.model.Venue;
import com.example.springproject.service.Venueservice;
import com.example.springproject.service.PolicyEnforcementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/venue")
@CrossOrigin(origins = "http://localhost:3000")
public class Venuecontroller {
    @Autowired
    private Venueservice venueservice;

    @Autowired
    private PolicyEnforcementService policyService;

    @PostMapping("/post")
    public String add(@RequestBody Venue venue, @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorUsername) {
        venueservice.saveVenue(venue, actorUsername);
        return "Venue added successfully";
    }

    @PutMapping("/update/{id}")
    public VenueDto updateVenue(@PathVariable Integer id, @RequestBody Venue updatedVenue, @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorUsername) {
        Venue venue = venueservice.updateVenue(id, updatedVenue, actorUsername);
        return convertToDto(venue);
    }

    @GetMapping("/get")
    public List<VenueDto> getAllVenues(
            @RequestParam(value = "username", required = false) String usernameParam,
            @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        
        // This is a common pattern now across controllers
        return venueservice.getAllVenues().stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    @DeleteMapping("/delete/{id}")
    public String deleteVenue(@PathVariable Integer id, @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorUsername) {
        venueservice.deleteVenue(id, actorUsername);
        return "Venue deleted successfully";
    }

    private VenueDto convertToDto(Venue venue) {
        VenueDto dto = new VenueDto();
        dto.setId(venue.getId());
        dto.setCentreId(venue.getCentre() != null ? venue.getCentre().getId() : null);
        dto.setVenueCode(venue.getVenueCode());
        dto.setName(venue.getName());
        dto.setCapacity(venue.getCapacity());
        dto.setType(venue.getType());
        dto.setPreference(venue.getPreference());
        dto.setActualCapacity(venue.getActualCapacity());
        dto.setInUse(venue.getInUse());
        return dto;
    }
}
