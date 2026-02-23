package com.example.springproject.service;

import com.example.springproject.model.Centre;
import com.example.springproject.repository.Centrerepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class Centreserviceimp implements Centreservice {
    @Autowired
    private Centrerepository centreRepository;

    @Autowired
    private PolicyEnforcementService policyService;

    @Override
    @Transactional
    public Centre saveCentre(Centre centre, String actorUsername) {
        // DIV: PEL Integration - Institutional changes are restricted
        policyService.enforceAlgorithmAccess(actorUsername); // Admin-only

        // DIV: Mandatory Pre-Mutation Check
        if (centre.getCode() == null || centre.getCode().isEmpty()) {
            throw new IllegalArgumentException("DIV-VIOLATION: Centre Code is mandatory");
        }

        return centreRepository.save(centre);
    }

    @Override
    public List<Centre> getAllCentres() {
        return centreRepository.findAll();
    }

    @Override
    @Transactional
    public Centre updateCentre(Integer id, Centre updatedCentre, String actorUsername) {
        // DIV: Fetch Managed Instance
        Centre existing = centreRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("INTEGRITY-ERROR: Centre " + id + " not found"));

        // DIV: PEL Integration
        policyService.enforceAlgorithmAccess(actorUsername);

        // DIV: Strict Sanitization & Update
        if (updatedCentre.getCode() != null) existing.setCode(updatedCentre.getCode());
        if (updatedCentre.getType() != null) existing.setType(updatedCentre.getType());
        if (updatedCentre.getName() != null) existing.setName(updatedCentre.getName());
        if (updatedCentre.getState() != null) existing.setState(updatedCentre.getState());
        
        return centreRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteCentre(Integer id, String actorUsername) {
        // DIV: Fetch Managed Instance
        Centre existing = centreRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("INTEGRITY-ERROR: Centre " + id + " not found"));

        // DIV: PEL Integration
        policyService.enforceAlgorithmAccess(actorUsername);

        centreRepository.deleteById(id);
    }
}
