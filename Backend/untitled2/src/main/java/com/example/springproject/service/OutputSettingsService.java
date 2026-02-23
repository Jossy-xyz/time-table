package com.example.springproject.service;

import com.example.springproject.model.OutputSettings;
import java.util.List;

public interface OutputSettingsService {
    OutputSettings saveSettings(OutputSettings settings, String actorUsername);
    OutputSettings getLatestSettings();
    List<OutputSettings> getAllSettings();
}
