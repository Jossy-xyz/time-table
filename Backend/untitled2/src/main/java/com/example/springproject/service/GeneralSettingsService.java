package com.example.springproject.service;

import com.example.springproject.model.GeneralSettings;
import java.util.List;

public interface GeneralSettingsService {
    GeneralSettings getLatestSettings();
    List<GeneralSettings> getHistory();
    GeneralSettings saveSettings(GeneralSettings settings, String actorUsername);
}
