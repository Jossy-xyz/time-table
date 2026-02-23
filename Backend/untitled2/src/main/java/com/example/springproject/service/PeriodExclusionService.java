package com.example.springproject.service;

import com.example.springproject.model.GeneralSettings;
import com.example.springproject.model.PeriodExclusionSnapshot;
import com.example.springproject.repository.GeneralSettingsRepository;
import com.example.springproject.repository.PeriodExclusionSnapshotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PeriodExclusionService {
    
    @Autowired
    private PeriodExclusionSnapshotRepository repository;

    @Autowired
    private GeneralSettingsRepository generalSettingsRepository;

    @Autowired
    private PolicyEnforcementService policyService;

    @Autowired
    private PeriodCalculationService periodCalculationService;

    @Autowired
    private PeriodExclusionValidator validator;
    
    public PeriodExclusionSnapshot getActiveByGeneralSettings(Long generalSettingsId) {
        return repository.findByGeneralSettingsIdAndIsActive(generalSettingsId, 1)
                         .orElse(null);
    }
    
    public PeriodExclusionSnapshot save(PeriodExclusionSnapshot snapshot, String actorUsername, boolean setAsActive) {
        // DIV-01: PEL Integration - Restrict to Admin
        policyService.enforceAlgorithmAccess(actorUsername);

        // DIV-02: Integrity Enforcement - Verify FK inputs
        GeneralSettings settings = snapshot.getGeneralSettings();
        if (settings == null || settings.getId() == null) {
             throw new IllegalArgumentException("DIV-VIOLATION: GeneralSettings is required");
        }
        
        // Fetch managed settings
        settings = generalSettingsRepository.findById(settings.getId())
                  .orElseThrow(() -> new IllegalArgumentException("DIV-VIOLATION: GeneralSettings with ID " + snapshot.getGeneralSettings().getId() + " not found"));

        // DIV-03: Mandatory Pre-Mutation Check - Validation logic moved from controller
        // Convert the snapshot's internal list back to a request for validation compatibility
        com.example.springproject.dto.PeriodExclusionRequest tempRequest = new com.example.springproject.dto.PeriodExclusionRequest();
        tempRequest.setName(snapshot.getName());
        tempRequest.setExcludedPeriods(snapshot.getExcludedPeriodsList());
        validator.validate(tempRequest, settings);

        // DIV-04: ENFORCEMENT logic - Automatically incorporate system-locked periods
        com.example.springproject.dto.PeriodMappingResponse mapping = periodCalculationService.calculatePeriodMapping(settings);
        java.util.List<Integer> systemLockedIndices = mapping.getPeriods().stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsSystemLocked()))
                .map(com.example.springproject.dto.PeriodMapping::getPeriodIndex)
                .collect(java.util.stream.Collectors.toList());

        java.util.Set<Integer> mergedExclusions = new java.util.HashSet<>(snapshot.getExcludedPeriodsList());
        mergedExclusions.addAll(systemLockedIndices);
        snapshot.setExcludedPeriodsList(new java.util.ArrayList<>(mergedExclusions));

        // DIV-05: Sanitization - Append-only (Force NEW record)
        snapshot.setId(null);
        snapshot.setCreatedBy(actorUsername);
        snapshot.setIsActive(setAsActive ? 1 : 0);
        
        // Deactivate others if this one is active
        if (setAsActive) {
            repository.deactivateAllByGeneralSettingsId(settings.getId());
        }
        
        return repository.save(snapshot);
    }
    
    public void activateSnapshot(Long snapshotId, String actorUsername) {
        // DIV-01: PEL Integration
        policyService.enforceAlgorithmAccess(actorUsername);

        PeriodExclusionSnapshot snapshot = repository.findById(snapshotId)
            .orElseThrow(() -> new RuntimeException("INTEGRITY-ERROR: Snapshot not found"));
        
        repository.deactivateAllByGeneralSettingsId(snapshot.getGeneralSettings().getId());
        snapshot.setIsActive(1);
        repository.save(snapshot);
    }
    
    public List<PeriodExclusionSnapshot> getHistory(Long generalSettingsId) {
        return repository.findByGeneralSettingsIdOrderByCreatedAtDesc(generalSettingsId);
    }
}
