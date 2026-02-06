package com.example.springproject.controller;

import com.example.springproject.dto.PeriodExclusionDto;
import com.example.springproject.dto.PeriodExclusionRequest;
import com.example.springproject.dto.PeriodMappingResponse;
import com.example.springproject.model.GeneralSettings;
import com.example.springproject.model.PeriodExclusionSnapshot;
import com.example.springproject.repository.GeneralSettingsRepository;
import com.example.springproject.service.PeriodCalculationService;
import com.example.springproject.service.PeriodExclusionService;
import com.example.springproject.service.PeriodExclusionValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/periods")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class PeriodExclusionController {

    @Autowired
    private PeriodCalculationService periodCalculationService;

    @Autowired
    private PeriodExclusionService periodExclusionService;

    @Autowired
    private PeriodExclusionValidator validator;

    @Autowired
    private GeneralSettingsRepository generalSettingsRepository;

    @Autowired
    private com.example.springproject.service.PolicyEnforcementService policyService;

    @GetMapping("/mapping")
    public ResponseEntity<PeriodMappingResponse> getPeriodMapping(@RequestParam(required = false) Long settingsId) {
        GeneralSettings settings = (settingsId != null) ? 
            generalSettingsRepository.findById(settingsId).orElse(null) :
            generalSettingsRepository.findTopByOrderByIdDesc();
            
        if (settings == null) {
            return ResponseEntity.ok(new PeriodMappingResponse());
        }
        
        PeriodMappingResponse response = periodCalculationService.calculatePeriodMapping(settings);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/exclusions/active")
    public ResponseEntity<PeriodExclusionDto> getActiveExclusions(@RequestParam(required = false) Long settingsId) {
        GeneralSettings settings = (settingsId != null) ? 
            generalSettingsRepository.findById(settingsId).orElse(null) :
            generalSettingsRepository.findTopByOrderByIdDesc();
            
        if (settings == null) {
             return ResponseEntity.ok(null);
        }
        
        PeriodExclusionSnapshot active = periodExclusionService.getActiveByGeneralSettings(settings.getId());
        
        if (active == null) {
            return ResponseEntity.ok(null);
        }
        
        return ResponseEntity.ok(toDto(active));
    }

    @PostMapping("/exclusions")
    public ResponseEntity<?> saveExclusions(
        @RequestBody PeriodExclusionRequest request,
        @RequestParam(required = false) Long settingsId,
        @RequestHeader(value = "X-Actor-Username", defaultValue = "system") String username
    ) {
        GeneralSettings settings = (settingsId != null) ? 
            generalSettingsRepository.findById(settingsId).orElse(null) :
            generalSettingsRepository.findTopByOrderByIdDesc();
            
        if (settings == null) {
            return ResponseEntity.badRequest().body("GeneralSettings not found");
        }
        
        // Enforce Admin-only access for defining exclusions
        // Use the username from the request header if avail, or the specific param
        policyService.enforceAlgorithmAccess(username);
        
        try {
            validator.validate(request, settings);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
        
        // ENFORCEMENT: Automatically include system-locked periods (e.g. pre-start dates)
        PeriodMappingResponse mapping = periodCalculationService.calculatePeriodMapping(settings);
        List<Integer> systemLockedIndices = mapping.getPeriods().stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsSystemLocked()))
                .map(com.example.springproject.dto.PeriodMapping::getPeriodIndex)
                .collect(Collectors.toList());

        // Merge User selections with System Locks (Set handles duplicates)
        java.util.Set<Integer> mergedExclusions = new java.util.HashSet<>();
        if (request.getExcludedPeriods() != null) {
            mergedExclusions.addAll(request.getExcludedPeriods());
        }
        mergedExclusions.addAll(systemLockedIndices);

        mergedExclusions.addAll(systemLockedIndices);

        PeriodExclusionSnapshot snapshot = new PeriodExclusionSnapshot();
        snapshot.setGeneralSettings(settings); // Line 111
        snapshot.setName(request.getName());
        snapshot.setExcludedPeriodsList(new java.util.ArrayList<>(mergedExclusions));
        snapshot.setIsActive(request.getSetAsActive() != null ? request.getSetAsActive() : false);
        snapshot.setCreatedBy(username);
        
        PeriodExclusionSnapshot saved = periodExclusionService.save(snapshot);
        
        return ResponseEntity.ok(Collections.singletonMap("id", saved.getId()));
    }

    @GetMapping("/exclusions/history")
    public ResponseEntity<List<PeriodExclusionDto>> getHistory(@RequestParam(required = false) Long settingsId) {
        GeneralSettings settings = (settingsId != null) ? 
            generalSettingsRepository.findById(settingsId).orElse(null) :
            generalSettingsRepository.findTopByOrderByIdDesc();
            
        if (settings == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        
        List<PeriodExclusionSnapshot> history = periodExclusionService.getHistory(settings.getId());
        List<PeriodExclusionDto> dtos = history.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/exclusions/{id}/activate")
    public ResponseEntity<?> activateSnapshot(
            @PathVariable Long id,
            @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String username
    ) {
        // Enforce Admin-only access for activating exclusions
        policyService.enforceAlgorithmAccess(username);
        
        try {
            periodExclusionService.activateSnapshot(id);
            return ResponseEntity.ok(Collections.singletonMap("message", "Snapshot activated"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private PeriodExclusionDto toDto(PeriodExclusionSnapshot snapshot) {
        PeriodExclusionDto dto = new PeriodExclusionDto();
        dto.setId(snapshot.getId());
        dto.setGeneralSettingsId(snapshot.getGeneralSettings().getId());
        dto.setName(snapshot.getName());
        dto.setDescription(snapshot.getDescription());
        dto.setExcludedPeriods(snapshot.getExcludedPeriodsList());
        dto.setIsActive(snapshot.getIsActive());
        dto.setCreatedBy(snapshot.getCreatedBy());
        dto.setCreatedAt(snapshot.getCreatedAt());
        return dto;
    }
}
