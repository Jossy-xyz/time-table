package com.example.springproject.service;

import com.example.springproject.model.Examtab;
import com.example.springproject.repository.Examtabrepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class Examtabserviceimp implements Examtabservice {
    @Autowired
    private Examtabrepository examtabRepository;

    @Autowired
    private PolicyEnforcementService policyService;

    @Override
    @Transactional
    public Examtab saveExamtab(Examtab examtab, String actorUsername) {
        // DIV-01: PEL Integration - Restrict to Admin
        policyService.enforceAlgorithmAccess(actorUsername);

        // DIV-02: Sanitization - Append-only for history
        examtab.setId(null);

        return examtabRepository.save(examtab);
    }

    @Override
    public List<Examtab> getAllExamtabs() {
        return examtabRepository.findAll();
    }
}
