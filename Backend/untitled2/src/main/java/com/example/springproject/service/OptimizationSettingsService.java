package com.example.springproject.service;

import com.example.springproject.model.OptimizationSettings;
import java.util.List;

public interface OptimizationSettingsService {
    OptimizationSettings saveSettings(OptimizationSettings settings, String actorUsername);
    List<OptimizationSettings> getAllSettings();
}
