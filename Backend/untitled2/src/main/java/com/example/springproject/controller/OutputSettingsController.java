package com.example.springproject.controller;

import com.example.springproject.model.OutputSettings;
import com.example.springproject.service.OutputSettingsService;
import com.example.springproject.service.PolicyEnforcementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/output")
@CrossOrigin(origins = "http://localhost:3000")
public class OutputSettingsController {
    @Autowired
    private OutputSettingsService settingsService;

    @Autowired
    private PolicyEnforcementService policyService;

    @PostMapping("/save")
    public String save(@RequestBody OutputSettings settings, 
                      @RequestParam(value = "username", required = false) String usernameParam,
                      @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        settingsService.saveSettings(settings, actorUsername);
        return "Output settings saved";
    }

    @GetMapping("/get")
    public OutputSettings getLatest(@RequestParam(value = "username", required = false) String usernameParam,
                                    @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        return settingsService.getLatestSettings();
    }

    @GetMapping("/history")
    public List<OutputSettings> getAll(@RequestParam(value = "username", required = false) String usernameParam,
                                       @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        return settingsService.getAllSettings();
    }
}
