package com.example.springproject.service;

import com.example.springproject.model.Program;
import com.example.springproject.repository.Programrepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class Programserviceimp implements Programservice {
    @Autowired
    private Programrepository programrepository;

    @Autowired
    private PolicyEnforcementService policyService;

    @Override
    @Transactional
    public Program saveProgram(Program program, String actorUsername) {
        // DIV-01: Integrity Enforcement - Verify FK inputs
        if (program.getDepartment() == null || program.getDepartment().getId() == null) {
            throw new IllegalArgumentException("DIV-VIOLATION: Program MUST be assigned to a Department");
        }

        // DIV-02: PEL Integration
        policyService.enforceScope(
            actorUsername, 
            program.getDepartment().getId(), 
            program.getDepartment().getCentre() != null ? program.getDepartment().getCentre().getId() : null
        );

        return programrepository.save(program);
    }

    @Override
    public List<Program> getAllPrograms() {
        return programrepository.findAll();
    }

    @Override
    @Transactional
    public Program updateProgram(Integer id, Program updatedProgram, String actorUsername) {
        Optional<Program> optional = programrepository.findById(id);
        if (optional.isPresent()) {
            Program existing = optional.get();
            
            // DIV: Scope Verification
            if (existing.getDepartment() != null) {
                policyService.enforceScope(
                    actorUsername, 
                    existing.getDepartment().getId(), 
                    existing.getDepartment().getCentre() != null ? existing.getDepartment().getCentre().getId() : null
                );
            }

            existing.setName(updatedProgram.getName());
            existing.setCode(updatedProgram.getCode());
            existing.setDuration(updatedProgram.getDuration());
            existing.setDepartment(updatedProgram.getDepartment());
            existing.setTotalCompulsoryUnits(updatedProgram.getTotalCompulsoryUnits());
            existing.setTotalRequiredUnits(updatedProgram.getTotalRequiredUnits());
            existing.setMinElectiveUnits(updatedProgram.getMinElectiveUnits());
            existing.setEntryRequirements(updatedProgram.getEntryRequirements());
            
            return programrepository.save(existing);
        }
        throw new RuntimeException("Program not found");
    }

    @Override
    @Transactional
    public void deleteProgram(Integer id, String actorUsername) {
        Program existing = programrepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Program not found"));
        
        // DIV: Scope Verification
        if (existing.getDepartment() != null) {
            policyService.enforceScope(
                actorUsername, 
                existing.getDepartment().getId(), 
                existing.getDepartment().getCentre() != null ? existing.getDepartment().getCentre().getId() : null
            );
        }
        
        programrepository.deleteById(id);
    }
}
