package com.example.springproject.controller;

import com.example.springproject.model.GeneralSettings;
import com.example.springproject.repository.GeneralSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/settings/general")
@CrossOrigin(origins = "http://localhost:3000")
public class GeneralSettingsController {

    @Autowired
    private GeneralSettingsRepository repository;

    @GetMapping
    public GeneralSettings getSettings() {
        GeneralSettings settings = repository.findTopByOrderByIdDesc();
        return settings != null ? settings : new GeneralSettings();
    }

    @PostMapping
    public GeneralSettings updateSettings(@RequestBody GeneralSettings settings) {
        // Since it's a singleton config effectively, we might want to update the existing one or create new
        // For simple history, we can always insert new, or update existing ID 1
        return repository.save(settings);
    }
}
