package com.example.springproject.service;

import com.example.springproject.model.Staff;
import com.example.springproject.model.Department;
import com.example.springproject.repository.Staffrepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class Staffserviceimp implements Staffservice {
    
    @Autowired
    private Staffrepository staffrepository;

    @Autowired
    private PolicyEnforcementService policyService;

    @Override
    @Transactional
    public Staff saveStaff(Staff staff, String actorUsername) {
        // DIV-01: Integrity Enforcement - Verify FK inputs
        if (staff.getCollege() == null || staff.getCollege().getId() == null) {
            throw new IllegalArgumentException("DIV-VIOLATION: Staff MUST be assigned to a College (cenID)");
        }

        // DIV-02: Mandatory Pre-Mutation Check - Natural Key uniqueness
        if (staffrepository.existsByStaffId(staff.getStaffId())) {
            throw new RuntimeException("INTEGRITY-ERROR: Staff with ID " + staff.getStaffId() + " already exists.");
        }

        // DIV-03: PEL Integration - Hierarchy defines scope
        policyService.enforceScope(
            actorUsername, 
            null, // No direct department link in staffmc
            staff.getCollege().getId()
        );

        return staffrepository.save(staff);
    }

    @Override
    public List<Staff> getAllStaff() {
        return staffrepository.findAll();
    }

    @Override
    public List<Staff> getStaffByDepartment(Department department) {
        // Legacy bridge: Finding staff via their college (imperfect but maintains compatibility)
        return staffrepository.findByCollegeId(department.getCentre().getId());
    }
    
    @Override
    public List<Staff> getStaffByCollege(Integer collegeId) {
        return staffrepository.findByCollegeId(collegeId);
    }

    @Override
    @Transactional
    public Staff updateStaff(Integer id, Staff updated, String actorUsername) {
        // DIV: Fetch Managed Instance
        Staff existing = staffrepository.findById(id)
            .orElseThrow(() -> new RuntimeException("INTEGRITY-ERROR: Staff serial " + id + " not found"));

        // DIV: PEL Integration
        policyService.enforceScope(
            actorUsername, 
            null,
            existing.getCollege().getId()
        );

        // DIV: Strict Sanitization & Update
        if (updated.getSurname() != null) existing.setSurname(updated.getSurname());
        if (updated.getFirstname() != null) existing.setFirstname(updated.getFirstname());
        if (updated.getMiddlename() != null) existing.setMiddlename(updated.getMiddlename());
        if (updated.getTitle() != null) existing.setTitle(updated.getTitle());
        if (updated.getStaffId() != null) existing.setStaffId(updated.getStaffId());
        if (updated.getStatusId() != null) existing.setStatusId(updated.getStatusId());
        if (updated.getInUse() != null) existing.setInUse(updated.getInUse());
        if (updated.getDutyCount() != null) existing.setDutyCount(updated.getDutyCount());
        if (updated.getShortName() != null) existing.setShortName(updated.getShortName());
        if (updated.getCollege() != null) existing.setCollege(updated.getCollege());
        
        return staffrepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteStaff(Integer id, String actorUsername) {
        // DIV: Fetch Managed Instance
        Staff existing = staffrepository.findById(id)
            .orElseThrow(() -> new RuntimeException("INTEGRITY-ERROR: Staff serial " + id + " not found"));

        // DIV: PEL Integration
        policyService.enforceScope(
            actorUsername, 
            null,
            existing.getCollege().getId()
        );

        staffrepository.deleteById(id);
    }
}
