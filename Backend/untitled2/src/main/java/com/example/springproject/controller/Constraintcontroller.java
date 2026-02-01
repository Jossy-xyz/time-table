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
@CrossOrigin("http://localhost:3000")
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
        policyService.enforceScope(actorUsername, null, null);
        constraintservice.saveConstrainttable(constrainttable);
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

    private ConstraintDto convertToDto(Constrainttable constraint) {
        ConstraintDto dto = new ConstraintDto();
        dto.setId(constraint.getId());
        dto.setDate(constraint.getDate());
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
        return dto;
    }
}
