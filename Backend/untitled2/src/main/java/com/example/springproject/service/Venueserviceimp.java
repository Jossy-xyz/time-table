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
        // DIV: Scope Verification
        policyService.enforceScope(actorUsername, null, venue.getCentre() != null ? venue.getCentre().getId() : null);
        return venuerepository.save(venue);
    }

    @Override
    public List<Venue> getAllVenues() {
        return venuerepository.findAll();
    }

    @Override
    @Transactional
    public Venue updateVenue(Integer id, Venue updatedVenue, String actorUsername) {
        Optional<Venue> optional = venuerepository.findById(id);
        if (optional.isPresent()) {
            Venue existing = optional.get();
            
            // DIV: Scope Verification
            policyService.enforceScope(actorUsername, null, existing.getCentre() != null ? existing.getCentre().getId() : null);

            existing.setVenueCode(updatedVenue.getVenueCode());
            existing.setName(updatedVenue.getName());
            existing.setCapacity(updatedVenue.getCapacity());
            existing.setActualCapacity(updatedVenue.getActualCapacity());
            existing.setType(updatedVenue.getType());
            existing.setLocation(updatedVenue.getLocation());
            existing.setPreference(updatedVenue.getPreference());
            existing.setInUse(updatedVenue.getInUse());
            return venuerepository.save(existing);
        }
        throw new RuntimeException("Venue not found");
    }

    @Override
    @Transactional
    public void deleteVenue(Integer id, String actorUsername) {
        Venue existing = venuerepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Venue not found"));
        
        // DIV: Scope Verification
        policyService.enforceScope(actorUsername, null, existing.getCentre() != null ? existing.getCentre().getId() : null);
        
        venuerepository.deleteById(id);
    }
}
