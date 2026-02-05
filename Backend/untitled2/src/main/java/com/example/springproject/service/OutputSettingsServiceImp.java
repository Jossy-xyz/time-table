package com.example.springproject.service;

import com.example.springproject.model.OutputSettings;
import com.example.springproject.repository.OutputSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OutputSettingsServiceImp implements OutputSettingsService {
    @Autowired
    private OutputSettingsRepository settingsRepository;

    @Override
    public OutputSettings saveSettings(OutputSettings settings) {
        return settingsRepository.save(settings);
    }

    @Override
    public List<OutputSettings> getAllSettings() {
        return settingsRepository.findAll();
    }
}
