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
    
    public PeriodExclusionSnapshot getActiveByGeneralSettings(Long generalSettingsId) {
        return repository.findByGeneralSettingsIdAndIsActive(generalSettingsId, true)
                         .orElse(null);
    }
    
    public PeriodExclusionSnapshot save(PeriodExclusionSnapshot snapshot) {
        // Ensure GeneralSettings exists and is set
        if (snapshot.getGeneralSettings() == null || snapshot.getGeneralSettings().getId() == null) {
             throw new IllegalArgumentException("GeneralSettings is required");
        }
        
        // Deactivate others if this one is active
        if (Boolean.TRUE.equals(snapshot.getIsActive())) {
            repository.deactivateAllByGeneralSettingsId(snapshot.getGeneralSettings().getId());
        }
        
        return repository.save(snapshot);
    }
    
    public void activateSnapshot(Long snapshotId) {
        PeriodExclusionSnapshot snapshot = repository.findById(snapshotId)
            .orElseThrow(() -> new RuntimeException("Snapshot not found"));
        
        repository.deactivateAllByGeneralSettingsId(snapshot.getGeneralSettings().getId());
        snapshot.setIsActive(true);
        repository.save(snapshot);
    }
    
    public List<PeriodExclusionSnapshot> getHistory(Long generalSettingsId) {
        return repository.findByGeneralSettingsIdOrderByCreatedAtDesc(generalSettingsId);
    }
}
