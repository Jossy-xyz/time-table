package com.example.springproject.service;

import com.example.springproject.model.Constrainttable;
import com.example.springproject.repository.Constrainttablerepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class Constraintserviceimp implements Constraintservice {
    @Autowired
    private Constrainttablerepository constraintRepository;
    @Autowired
    private PolicyEnforcementService policyService;

    @Override
    @Transactional
    public Constrainttable saveConstrainttable(Constrainttable constrainttable, String actorUsername) {
        // DIV: PEL Integration - Global constraints restricted to Admin
        policyService.enforceAlgorithmAccess(actorUsername);

        // DIV: Sanitization - Ensure record is new (Append-only)
        constrainttable.setId(null); 
        
        if (constrainttable.getName() == null || constrainttable.getName().trim().isEmpty()) {
            constrainttable.setName("Snapshot " + new java.util.Date());
        }

        return constraintRepository.save(constrainttable);
    }

    @Override
    public List<Constrainttable> getAllConstraints() {
        return constraintRepository.findAll();
    }
}
