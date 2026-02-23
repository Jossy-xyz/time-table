package com.example.springproject.service;

import com.example.springproject.model.StudentSemesterRegistration;
import com.example.springproject.model.Student;
import com.example.springproject.repository.Studentrepository;
import com.example.springproject.repository.StudentSemesterRegistrationrepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StudentSemesterRegistrationserviceimp implements StudentSemesterRegistrationservice {
    
    @Autowired
    private StudentSemesterRegistrationrepository repository;

    @Autowired
    private PolicyEnforcementService policyService;

    @Autowired
    private Studentrepository studentrepository;

    @Override
    @Transactional
    public StudentSemesterRegistration saveStudentSemesterRegistration(StudentSemesterRegistration registration, String actorUsername) {
        // DIV-01: Integrity Enforcement - Verify FK inputs
        if (registration.getStudent() == null || registration.getStudent().getId() == null) {
             throw new IllegalArgumentException("DIV-VIOLATION: Student Matric No is mandatory for enrollment");
        }

        // DIV-02: Mandatory Pre-Mutation Check - Fetch Managed Student
        Student student = studentrepository.findById(registration.getStudent().getId())
                .orElseThrow(() -> new RuntimeException("INTEGRITY-ERROR: Student not found with Matric No: " + registration.getStudent().getId()));
        
        registration.setStudent(student);

        // DIV-03: PEL Integration - Hierarchy defines scope
        policyService.enforceScope(
            actorUsername, 
            student.getDepartment() != null ? student.getDepartment().getId() : null,
            student.getCollege() != null ? student.getCollege().getId() : null
        );

        // DIV-04: Business Invariant - Prevent duplicate enrollment
        boolean exists = repository.existsByStudentAndSessionAndSemester(
            student,
            registration.getSession(),
            registration.getSemester()
        );

        if (exists) {
            throw new RuntimeException("BUSINESS-RULE-VIOLATION: Student is already enrolled for this session and semester.");
        }

        return repository.save(registration);
    }

    @Override
    public List<StudentSemesterRegistration> getAllStudentSemesterRegistrations() {
        return repository.findAll();
    }

    @Override
    @Transactional
    public StudentSemesterRegistration updateStudentSemesterRegistration(Long id, StudentSemesterRegistration updated, String actorUsername) {
        // DIV-01: Fetch Managed Instance
        StudentSemesterRegistration existing = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("INTEGRITY-ERROR: Enrollment record " + id + " not found"));

        // DIV-02: PEL Integration
        policyService.enforceScope(
            actorUsername, 
            existing.getStudent().getDepartment() != null ? existing.getStudent().getDepartment().getId() : null,
            existing.getStudent().getCollege() != null ? existing.getStudent().getCollege().getId() : null
        );

        // DIV-03: Strict Sanitization & Update
        if (updated.getSession() != null) existing.setSession(updated.getSession());
        if (updated.getSemester() != null) existing.setSemester(updated.getSemester());
        if (updated.getLevel() != null) existing.setLevel(updated.getLevel());
        
        return repository.save(existing);
    }

    @Override
    @Transactional
    public void deleteStudentSemesterRegistration(Long id, String actorUsername) {
        // DIV-01: Fetch Managed Instance
        StudentSemesterRegistration existing = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("INTEGRITY-ERROR: Enrollment record " + id + " not found"));

        // DIV-02: PEL Integration
        policyService.enforceScope(
            actorUsername, 
            existing.getStudent().getDepartment() != null ? existing.getStudent().getDepartment().getId() : null,
            existing.getStudent().getCollege() != null ? existing.getStudent().getCollege().getId() : null
        );

        repository.deleteById(id);
    }
}
