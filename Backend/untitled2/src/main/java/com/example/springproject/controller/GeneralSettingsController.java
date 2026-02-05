package com.example.springproject.controller;

import com.example.springproject.model.GeneralSettings;
import com.example.springproject.repository.GeneralSettingsRepository;
import com.example.springproject.service.PolicyEnforcementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/settings/general")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class GeneralSettingsController {

    @Autowired
    private GeneralSettingsRepository repository;

    @Autowired
    private PolicyEnforcementService policyService;

    @GetMapping
    public GeneralSettings getSettings() {
        return repository.findTopByOrderByIdDesc();
    }

    @GetMapping("/history")
    public java.util.List<GeneralSettings> getHistory() {
        return repository.findAll().stream()
                .sorted((a, b) -> b.getId().compareTo(a.getId())) // Newest ID first
                .collect(java.util.stream.Collectors.toList());
    }

    @PostMapping
    public GeneralSettings updateSettings(
            @RequestBody GeneralSettings settings,
            @RequestParam(value = "username", required = false) String usernameParam,
            @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        
        // Only admins can modify general settings
        policyService.enforceAlgorithmAccess(actorUsername);
        
        // APPEND-ONLY for history tracking
        settings.setId(null);
        return repository.save(settings);
    }
}

