package com.example.springproject.service;

import com.example.springproject.model.Department;
import com.example.springproject.repository.Departmentrepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class Departmentserviceimp implements Departmentservice {
    @Autowired
    private Departmentrepository departmentrepository;

    @Autowired
    private PolicyEnforcementService policyService;

    @Override
    @Transactional
    public Department saveDepartment(Department department, String actorUsername) {
        // DIV-01: Integrity Enforcement - Verify FK inputs
        if (department.getCentre() == null || department.getCentre().getId() == null) {
            throw new IllegalArgumentException("DIV-VIOLATION: Department MUST be assigned to a Centre");
        }

        // DIV-02: PEL Integration - Dept management restricted to Admin/College Rep
        policyService.enforceVenueAccess(actorUsername); 
        // Hierarchy Scope Check
        policyService.enforceScope(actorUsername, null, department.getCentre().getId());

        return departmentrepository.save(department);
    }

    @Override
    public List<Department> getAllDepartments() {
        return departmentrepository.findAll();
    }

    @Override
    @Transactional
    public Department updateDepartment(int id, Department updatedDepartment, String actorUsername) {
        // DIV: Fetch Managed Instance
        Department existing = departmentrepository.findById(id)
            .orElseThrow(() -> new RuntimeException("INTEGRITY-ERROR: Department " + id + " not found"));

        // DIV: PEL Integration
        policyService.enforceVenueAccess(actorUsername);
        policyService.enforceScope(actorUsername, null, existing.getCentre().getId());

        // DIV: Strict Sanitization & Update
        if (updatedDepartment.getCode() != null) existing.setCode(updatedDepartment.getCode());
        if (updatedDepartment.getName() != null) existing.setName(updatedDepartment.getName());
        if (updatedDepartment.getCentre() != null) existing.setCentre(updatedDepartment.getCentre());
        
        return departmentrepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteDepartment(int id, String actorUsername) {
        // DIV: Fetch Managed Instance
        Department existing = departmentrepository.findById(id)
            .orElseThrow(() -> new RuntimeException("INTEGRITY-ERROR: Department " + id + " not found"));

        // DIV: PEL Integration
        policyService.enforceVenueAccess(actorUsername);
        policyService.enforceScope(actorUsername, null, existing.getCentre().getId());

        departmentrepository.deleteById(id);
    }
}
