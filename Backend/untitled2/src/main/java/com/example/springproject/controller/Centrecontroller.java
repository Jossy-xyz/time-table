package com.example.springproject.controller;

import com.example.springproject.dto.CentreDto;
import com.example.springproject.model.Centre;
import com.example.springproject.service.Centreservice;
import com.example.springproject.service.PolicyEnforcementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping({"/centre", "/college"})
public class Centrecontroller {
    @Autowired
    private Centreservice centreService;

    @Autowired
    private PolicyEnforcementService policyService;

    @PostMapping("/post")
    public String add(@RequestBody Centre centre, 
                     @RequestParam(value = "username", required = false) String usernameParam,
                     @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        centreService.saveCentre(centre, actorUsername);
        return "Centre added successfully";
    }

    @PutMapping("/update/{id}")
    public CentreDto updateCentre(@PathVariable Integer id, @RequestBody Centre updatedCentre, 
                                 @RequestParam(value = "username", required = false) String usernameParam,
                                 @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        Centre centre = centreService.updateCentre(id, updatedCentre, actorUsername);
        return convertToDto(centre);
    }

    @GetMapping("/get")
    public List<CentreDto> getAllCentres(@RequestParam(value = "username", required = false) String usernameParam,
                                        @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        return centreService.getAllCentres().stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    @DeleteMapping("/delete/{id}")
    public String deleteCentre(@PathVariable Integer id, 
                              @RequestParam(value = "username", required = false) String usernameParam,
                              @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        centreService.deleteCentre(id, actorUsername);
        return "Centre deleted successfully";
    }

    private CentreDto convertToDto(Centre centre) {
        CentreDto dto = new CentreDto();
        dto.setId(centre.getId());
        dto.setCode(centre.getCode());
        dto.setName(centre.getName());
        dto.setType(centre.getType());
        dto.setState(centre.getState());
        return dto;
    }
}
