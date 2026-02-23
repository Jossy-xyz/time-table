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
        @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorUsername
    ) {
        GeneralSettings settings = (settingsId != null) ? 
            generalSettingsRepository.findById(settingsId).orElse(null) :
            generalSettingsRepository.findTopByOrderByIdDesc();
            
        if (settings == null) {
            return ResponseEntity.badRequest().body("GeneralSettings not found");
        }
        
        PeriodExclusionSnapshot snapshot = new PeriodExclusionSnapshot();
        snapshot.setGeneralSettings(settings);
        snapshot.setName(request.getName());
        snapshot.setExcludedPeriodsList(request.getExcludedPeriods());
        
        boolean setAsActive = (request.getSetAsActive() != null && request.getSetAsActive());
        
        PeriodExclusionSnapshot saved = periodExclusionService.save(snapshot, actorUsername, setAsActive);
        
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
            @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorUsername
    ) {
        try {
            periodExclusionService.activateSnapshot(id, actorUsername);
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
        dto.setExcludedPeriods(snapshot.getExcludedPeriodsList());
        dto.setIsActive(snapshot.getIsActive() != null && snapshot.getIsActive() == 1);
        dto.setCreatedBy(snapshot.getCreatedBy());
        dto.setCreatedAt(snapshot.getCreatedAt());
        return dto;
    }
}
