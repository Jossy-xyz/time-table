package com.example.springproject.service;

import com.example.springproject.model.Venue;
import com.example.springproject.repository.Venuerepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class Venueserviceimp implements Venueservice {
    @Autowired
    private Venuerepository venuerepository;

    @Autowired
    private PolicyEnforcementService policyService;

    @Override
    @Transactional
    public Venue saveVenue(Venue venue, String actorUsername) {
        // DIV-01: Integrity Enforcement - Verify FK inputs
        if (venue.getCentre() == null || venue.getCentre().getId() == null) {
            throw new IllegalArgumentException("DIV-VIOLATION: Venue MUST be assigned to a College (cenID)");
        }

        // DIV-02: Mandatory Pre-Mutation Check - Code uniqueness (if applicable, though venue uses auto-id, code is often unique)
        // ... (Skipping code uniqueness unless schema specifies it)

        // DIV-03: PEL Integration - Role and Hierarchy checks
        policyService.enforceVenueAccess(actorUsername); // Must be AD or CR
        policyService.enforceScope(actorUsername, null, venue.getCentre().getId());

        return venuerepository.save(venue);
    }

    @Override
    public List<Venue> getAllVenues() {
        return venuerepository.findAll();
    }

    @Override
    @Transactional
    public Venue updateVenue(Integer id, Venue updatedVenue, String actorUsername) {
        // DIV: Fetch Managed Instance
        Venue existing = venuerepository.findById(id)
            .orElseThrow(() -> new RuntimeException("INTEGRITY-ERROR: Venue " + id + " not found"));
            
        // DIV: PEL Integration
        policyService.enforceVenueAccess(actorUsername);
        policyService.enforceScope(actorUsername, null, existing.getCentre().getId());

        // DIV: Strict Sanitization & Update
        if (updatedVenue.getVenueCode() != null) existing.setVenueCode(updatedVenue.getVenueCode());
        if (updatedVenue.getName() != null) existing.setName(updatedVenue.getName());
        if (updatedVenue.getCapacity() != null) existing.setCapacity(updatedVenue.getCapacity());
        if (updatedVenue.getActualCapacity() != null) existing.setActualCapacity(updatedVenue.getActualCapacity());
        if (updatedVenue.getType() != null) existing.setType(updatedVenue.getType());
        if (updatedVenue.getPreference() != null) existing.setPreference(updatedVenue.getPreference());
        if (updatedVenue.getInUse() != null) existing.setInUse(updatedVenue.getInUse());
        if (updatedVenue.getCentre() != null) existing.setCentre(updatedVenue.getCentre());
        
        return venuerepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteVenue(Integer id, String actorUsername) {
        // DIV: Fetch Managed Instance
        Venue existing = venuerepository.findById(id)
            .orElseThrow(() -> new RuntimeException("INTEGRITY-ERROR: Venue " + id + " not found"));
        
        // DIV: PEL Integration
        policyService.enforceVenueAccess(actorUsername);
        policyService.enforceScope(actorUsername, null, existing.getCentre().getId());
        
        venuerepository.deleteById(id);
    }
}
