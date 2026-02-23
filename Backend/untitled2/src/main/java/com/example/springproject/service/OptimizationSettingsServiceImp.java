package com.example.springproject.service;

import com.example.springproject.model.OptimizationSettings;
import com.example.springproject.repository.OptimizationSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OptimizationSettingsServiceImp implements OptimizationSettingsService {
    @Autowired
    private OptimizationSettingsRepository settingsRepository;

    @Autowired
    private PolicyEnforcementService policyService;

    @Override
    @Transactional
    public OptimizationSettings saveSettings(OptimizationSettings settings, String actorUsername) {
        // DIV: PEL Integration - Restrict to Admin
        policyService.enforceAlgorithmAccess(actorUsername);

        // DIV: Sanitization - Ensure record is new (Append-only)
        settings.setId(null);

        return settingsRepository.save(settings);
    }

    @Override
    public List<OptimizationSettings> getAllSettings() {
        return settingsRepository.findAll();
    }
}
