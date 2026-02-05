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
        // DIV: Scope Verification
        policyService.enforceScope(
            actorUsername, 
            staff.getDepartment().getId(),
            staff.getDepartment().getCentre().getId()
        );

        if (staffrepository.existsByStaffId(staff.getStaffId())) {
            throw new RuntimeException("Staff with ID " + staff.getStaffId() + " already exists.");
        }

        return staffrepository.save(staff);
    }

    @Override
    public List<Staff> getAllStaff() {
        return staffrepository.findAll();
    }

    @Override
    public List<Staff> getStaffByDepartment(Department department) {
        return staffrepository.findByDepartment(department);
    }
    
    @Override
    public List<Staff> getStaffByCollege(Integer collegeId) {
        return staffrepository.findByDepartmentCentreId(collegeId);
    }

    @Override
    @Transactional
    public Staff updateStaff(Integer id, Staff updated, String actorUsername) {
        Staff existing = staffrepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Staff not found"));

        // DIV: Scope Verification
        policyService.enforceScope(
            actorUsername, 
            existing.getDepartment().getId(),
            existing.getDepartment().getCentre().getId()
        );

        existing.setSurname(updated.getSurname());
        existing.setFirstname(updated.getFirstname());
        existing.setMiddlename(updated.getMiddlename());
        existing.setTitle(updated.getTitle());
        existing.setStaffId(updated.getStaffId());
        existing.setStatusId(updated.getStatusId());
        existing.setType(updated.getType());
        existing.setInUse(updated.getInUse());
        existing.setDutyCount(updated.getDutyCount());
        existing.setSpecialization(updated.getSpecialization());
        existing.setResearchArea(updated.getResearchArea());
        existing.setDiscipline(updated.getDiscipline());
        existing.setShortName(updated.getShortName());
        existing.setSerialNo(updated.getSerialNo());
        existing.setDepartment(updated.getDepartment());
        
        return staffrepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteStaff(Integer id, String actorUsername) {
        Staff existing = staffrepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Staff not found"));

        // DIV: Scope Verification
        policyService.enforceScope(
            actorUsername, 
            existing.getDepartment().getId(),
            existing.getDepartment().getCentre().getId()
        );

        staffrepository.deleteById(id);
    }
}
