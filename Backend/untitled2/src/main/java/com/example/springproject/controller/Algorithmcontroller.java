package com.example.springproject.controller;

import com.example.springproject.service.PolicyEnforcementService;
import com.example.springproject.service.SchedulerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/algorithm")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class AlgorithmController {

    @Autowired
    private SchedulerService schedulerService;

    @Autowired
    private PolicyEnforcementService policyService;

    @PostMapping("/trigger")
    public ResponseEntity<?> triggerAlgorithm(
            @RequestParam(value = "generalSettingsId", required = false) Long generalSettingsId,
            @RequestParam(value = "constraintId", required = false) Integer constraintId,
            @RequestParam(value = "exclusionSnapshotId", required = false) Long exclusionSnapshotId,
            @RequestParam(value = "username", required = false) String usernameParam,
            @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        
        // Enforce Admin-only access for algorithm triggering
        policyService.enforceAlgorithmAccess(actorUsername);
        
        schedulerService.triggerAlgorithm(generalSettingsId, constraintId, exclusionSnapshotId);
        
        return ResponseEntity.ok(Map.of(
            "message", "Algorithm started successfully", 
            "status", "QUEUED"
        ));
    }
}
