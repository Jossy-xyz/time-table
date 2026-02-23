package com.example.springproject.service;

import com.example.springproject.model.OutputSettings;
import com.example.springproject.repository.OutputSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OutputSettingsServiceImp implements OutputSettingsService {
    @Autowired
    private OutputSettingsRepository settingsRepository;

    @Autowired
    private PolicyEnforcementService policyService;

    @Override
    @Transactional
    public OutputSettings saveSettings(OutputSettings settings, String actorUsername) {
        // DIV: PEL Integration - Restrict to Admin
        policyService.enforceAlgorithmAccess(actorUsername);

        // DIV: Sanitization - Ensure record is new (Append-only)
        settings.setId(null);

        return settingsRepository.save(settings);
    }

    @Override
    public OutputSettings getLatestSettings() {
        return settingsRepository.findTopByOrderByIdDesc();
    }

    @Override
    public List<OutputSettings> getAllSettings() {
        return settingsRepository.findAll();
    }
}
