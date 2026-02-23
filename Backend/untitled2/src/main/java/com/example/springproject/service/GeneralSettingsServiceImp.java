package com.example.springproject.service;

import com.example.springproject.model.GeneralSettings;
import com.example.springproject.repository.GeneralSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GeneralSettingsServiceImp implements GeneralSettingsService {

    @Autowired
    private GeneralSettingsRepository repository;

    @Autowired
    private PolicyEnforcementService policyService;

    @Override
    public GeneralSettings getLatestSettings() {
        return repository.findTopByOrderByIdDesc();
    }

    @Override
    public List<GeneralSettings> getHistory() {
        return repository.findAll().stream()
                .sorted((a, b) -> b.getId().compareTo(a.getId()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GeneralSettings saveSettings(GeneralSettings settings, String actorUsername) {
        // DIV: PEL Integration - Restrict to Admin
        policyService.enforceAlgorithmAccess(actorUsername);

        // DIV: Sanitization - Append-only logic
        settings.setId(null);

        // DIV: Validation - Ensure basic fields are present (as desired)
        if (settings.getStartDate() == null || settings.getEndDate() == null) {
            throw new IllegalArgumentException("DIV-VIOLATION: Exam start and end dates are required.");
        }

        return repository.save(settings);
    }
}
