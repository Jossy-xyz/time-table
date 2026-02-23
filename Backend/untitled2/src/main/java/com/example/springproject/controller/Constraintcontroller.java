package com.example.springproject.controller;

import com.example.springproject.dto.ConstraintDto;
import com.example.springproject.model.Constrainttable;
import com.example.springproject.service.Constraintservice;
import com.example.springproject.service.PolicyEnforcementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/constraint")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class Constraintcontroller {
    @Autowired
    private Constraintservice constraintservice;

    @Autowired
    private PolicyEnforcementService policyService;

    @PostMapping("/add")
    public String add(@RequestBody Constrainttable constrainttable, 
                     @RequestParam(value = "username", required = false) String usernameParam,
                     @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        constraintservice.saveConstrainttable(constrainttable, actorUsername);
        return "Constraints saved successfully";
    }
 
    @GetMapping("/get/latest")
    public ConstraintDto getLatest(@RequestParam(value = "username", required = false) String usernameParam,
                                  @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        // Return latest constraints
        List<Constrainttable> all = constraintservice.getAllConstraints(); 
        if (all.isEmpty()) return null;
        return convertToDto(all.get(all.size() - 1));
    }

    @GetMapping("/history")
    public List<ConstraintDto> getHistory(@RequestParam(value = "username", required = false) String usernameParam,
                                         @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        policyService.enforceScope(actorUsername, null, null);
        
        return constraintservice.getAllConstraints().stream()
                .map(this::convertToDto)
                .sorted((a, b) -> b.getDate().compareTo(a.getDate())) // Newest first
                .collect(Collectors.toList());
    }

    private ConstraintDto convertToDto(Constrainttable constraint) {
        ConstraintDto dto = new ConstraintDto();
        dto.setId(constraint.getId());
        dto.setName(constraint.getName());
        dto.setDate(constraint.getRecordDate());
        dto.setPeriodIncE(constraint.getPeriodIncE());
        dto.setPeriodExcE(constraint.getPeriodExcE());
        dto.setVenueIncE(constraint.getVenueIncE());
        dto.setVenueExcE(constraint.getVenueExcE());
        dto.setPeriodIncV(constraint.getPeriodIncV());
        dto.setPeriodExcV(constraint.getPeriodExcV());
        dto.setExamWAftE(constraint.getExamWAftE());
        dto.setExamExcE(constraint.getExamExcE());
        dto.setExamWCoinE(constraint.getExamWCoinE());
        dto.setFrontLE(constraint.getFrontLE());
        dto.setStaffOmit(constraint.getStaffOmit());
        dto.setStaffPeriodExcl(constraint.getStaffPeriodExcl());
        return dto;
    }
}

