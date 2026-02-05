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
        // FETCH MANAGED STUDENT
        if (registration.getStudent() == null || registration.getStudent().getId() == null) {
             throw new IllegalArgumentException("Student ID is required");
        }

        Student student = studentrepository.findById(registration.getStudent().getId())
                .orElseThrow(() -> new RuntimeException("Student not found with ID: " + registration.getStudent().getId()));
        
        registration.setStudent(student);

        // DIV: Scope Verification
        policyService.enforceScope(
            actorUsername, 
            student.getDepartment().getId(),
            student.getDepartment().getCentre().getId()
        );

        // Prevent duplicate enrollment for same session/semester
        boolean exists = repository.existsByStudentAndSessionAndSemester(
            registration.getStudent(),
            registration.getSession(),
            registration.getSemester()
        );

        if (exists) {
            throw new RuntimeException("Student is already enrolled for this session and semester.");
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
        StudentSemesterRegistration existing = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Enrollment record not found"));

        // DIV: Scope Verification
        policyService.enforceScope(
            actorUsername, 
            existing.getStudent().getDepartment().getId(),
            existing.getStudent().getDepartment().getCentre().getId()
        );

        existing.setStudent(updated.getStudent());
        existing.setSession(updated.getSession());
        existing.setSemester(updated.getSemester());
        existing.setLevel(updated.getLevel());
        
        return repository.save(existing);
    }

    @Override
    @Transactional
    public void deleteStudentSemesterRegistration(Long id, String actorUsername) {
        StudentSemesterRegistration existing = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Enrollment record not found"));

        // DIV: Scope Verification
        policyService.enforceScope(
            actorUsername, 
            existing.getStudent().getDepartment().getId(),
            existing.getStudent().getDepartment().getCentre().getId()
        );

        repository.deleteById(id);
    }
}
