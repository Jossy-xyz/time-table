package com.example.springproject.service;

import com.example.springproject.model.OptimizationSettings;
import com.example.springproject.repository.OptimizationSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OptimizationSettingsServiceImp implements OptimizationSettingsService {
    @Autowired
    private OptimizationSettingsRepository settingsRepository;

    @Override
    public OptimizationSettings saveSettings(OptimizationSettings settings) {
        return settingsRepository.save(settings);
    }

    @Override
    public List<OptimizationSettings> getAllSettings() {
        return settingsRepository.findAll();
    }
}
