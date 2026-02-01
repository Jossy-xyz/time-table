package com.example.springproject.service;

import com.example.springproject.model.Registration;
import com.example.springproject.model.StudentSemesterRegistration;
import com.example.springproject.repository.Registrationrepository;
import com.example.springproject.repository.StudentSemesterRegistrationrepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class Registrationserviceimp implements Registrationservice {
    
    @Autowired
    private Registrationrepository registrationrepository;

    @Autowired
    private StudentSemesterRegistrationrepository semesterRegistrationRepository;

    @Autowired
    private PolicyEnforcementService policyService;

    @Override
    @Transactional
    public Registration saveRegistration(Registration registration, String actorUsername) {
        // DIV-01: Scope Verification
        // Verify if the actor has permission to register students in this department/college
        policyService.enforceScope(
            actorUsername, 
            registration.getStudent().getDepartment().getId(),
            registration.getStudent().getDepartment().getCentre().getId()
        );

        // ENROLLMENT-FIRST PRINCIPLE CHECK
        boolean isEnrolled = semesterRegistrationRepository.existsByStudentAndSessionAndSemester(
            registration.getStudent(), 
            registration.getSession(), 
            registration.getSemester()
        );

        if (!isEnrolled) {
            throw new RuntimeException("Enrollment-First Violation: Student must enroll for the semester before registering for courses.");
        }

        // Check for double registration
        if (registrationrepository.existsByStudentAndCourseAndSession(
            registration.getStudent(), registration.getCourse(), registration.getSession())) {
            throw new RuntimeException("Student is already registered for this course.");
        }

        return registrationrepository.save(registration);
    }

    @Override
    public List<Registration> getAllRegistration() {
        return registrationrepository.findAll();
    }

    @Override
    @Transactional
    public Registration updateRegistration(Long id, Registration updated, String actorUsername) {
        Registration existing = registrationrepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Registration record not found"));

        // DIV-02: Scope Verification
        policyService.enforceScope(
            actorUsername, 
            existing.getStudent().getDepartment().getId(),
            existing.getStudent().getDepartment().getCentre().getId()
        );

        // Re-verify enrollment for new session/semester
        boolean isEnrolled = semesterRegistrationRepository.existsByStudentAndSessionAndSemester(
            updated.getStudent(), updated.getSession(), updated.getSemester()
        );

        if (!isEnrolled) {
            throw new RuntimeException("Enrollment-First Violation: Target session/semester lacks enrollment.");
        }

        existing.setStudent(updated.getStudent());
        existing.setCourse(updated.getCourse());
        existing.setSession(updated.getSession());
        existing.setSemester(updated.getSemester());
        
        return registrationrepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteRegistration(Long id, String actorUsername) {
        Registration existing = registrationrepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Registration record not found"));

        // DIV-03: Scope Verification
        policyService.enforceScope(
            actorUsername, 
            existing.getStudent().getDepartment().getId(),
            existing.getStudent().getDepartment().getCentre().getId()
        );

        registrationrepository.deleteById(id);
    }
}
