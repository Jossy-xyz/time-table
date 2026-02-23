package com.example.springproject.controller;

import com.example.springproject.model.GeneralSettings;
import com.example.springproject.service.GeneralSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/settings/general")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class GeneralSettingsController {

    @Autowired
    private GeneralSettingsService settingsService;

    @GetMapping
    public GeneralSettings getSettings() {
        return settingsService.getLatestSettings();
    }

    @GetMapping("/history")
    public java.util.List<GeneralSettings> getHistory() {
        return settingsService.getHistory();
    }

    @PostMapping
    public GeneralSettings updateSettings(
            @RequestBody GeneralSettings settings,
            @RequestParam(value = "username", required = false) String usernameParam,
            @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        return settingsService.saveSettings(settings, actorUsername);
    }
}

