package com.example.springproject.controller;

import com.example.springproject.model.OptimizationSettings;
import com.example.springproject.service.OptimizationSettingsService;
import com.example.springproject.service.PolicyEnforcementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/optimization")
@CrossOrigin(origins = "http://localhost:3000")
public class OptimizationSettingsController {
    @Autowired
    private OptimizationSettingsService settingsService;

    @Autowired
    private PolicyEnforcementService policyService;

    @PostMapping("/save")
    public String save(@RequestBody OptimizationSettings settings, 
                      @RequestParam(value = "username", required = false) String usernameParam,
                      @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        settingsService.saveSettings(settings, actorUsername);
        return "Optimization settings saved";
    }

    @GetMapping("/get")
    public List<OptimizationSettings> getAll(@RequestParam(value = "username", required = false) String usernameParam,
                                            @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        return settingsService.getAllSettings();
    }
}
