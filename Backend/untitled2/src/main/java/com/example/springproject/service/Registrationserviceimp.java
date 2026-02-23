package com.example.springproject.service;

import com.example.springproject.model.Registration;
import com.example.springproject.model.StudentSemesterRegistration;
import com.example.springproject.model.Course;
import com.example.springproject.model.Student;
import com.example.springproject.repository.Courserepository;
import com.example.springproject.repository.Studentrepository;
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
    private Studentrepository studentrepository;

    @Autowired
    private Courserepository courserepository;

    @Autowired
    private PolicyEnforcementService policyService;

    @Override
    @Transactional
    public Registration saveRegistration(Registration registration, String actorUsername) {
        // DIV: Integrity Enforcement - Verify FK inputs
        if (registration.getStudent() == null || registration.getStudent().getId() == null) {
             throw new IllegalArgumentException("DIV-VIOLATION: Student Matric No is mandatory");
        }
        if (registration.getCourse() == null || registration.getCourse().getId() == null) {
             throw new IllegalArgumentException("DIV-VIOLATION: Course Code is mandatory");
        }

        // DIV: Sanitization & Constraint Check
        if (registration.getSession() == null || registration.getSession().isEmpty()) {
            throw new IllegalArgumentException("DIV-VIOLATION: Academic Session is required for registration");
        }
        if (registration.getSemester() == null || (registration.getSemester() != 1 && registration.getSemester() != 2)) {
            throw new IllegalArgumentException("DIV-VIOLATION: Invalid Semester (Must be 1 or 2)");
        }

        // DIV: Mandatory Pre-Mutation Check - Fetch Managed Entities
        Student student = studentrepository.findById(registration.getStudent().getId())
                .orElseThrow(() -> new RuntimeException("INTEGRITY-ERROR: Student not found with Matric No: " + registration.getStudent().getId()));
        
        Course course = courserepository.findById(registration.getCourse().getId())
                .orElseThrow(() -> new RuntimeException("INTEGRITY-ERROR: Course not found with code: " + registration.getCourse().getId()));

        // DIV: PEL Integration - Hierarchy defines scope
        policyService.enforceScope(
            actorUsername, 
            student.getDepartment() != null ? student.getDepartment().getId() : null,
            student.getCollege() != null ? student.getCollege().getId() : null
        );

        // DIV: Business Invariant - Enforce the "Enrollment-First" rule
        boolean isEnrolled = semesterRegistrationRepository.existsByStudentAndSessionAndSemester(
            student, 
            registration.getSession(), 
            registration.getSemester()
        );

        if (!isEnrolled) {
            throw new RuntimeException("BUSINESS-RULE-VIOLATION: Enrollment-First Violation. Student " + student.getMatricNo() + 
                " must enroll for " + registration.getSession() + " (Sem " + registration.getSemester() + ") before registering for courses.");
        }

        // DIV: Business Invariant - Prevent Double Registration
        if (registrationrepository.existsByStudentAndCourseAndSessionAndSemester(
            student, course, registration.getSession(), registration.getSemester())) {
            throw new RuntimeException("BUSINESS-RULE-VIOLATION: Duplicate Course Registration detected.");
        }

        // Align registration metadata
        registration.setStudent(student);
        registration.setCourse(course);
        registration.setCollege(student.getCollege()); 

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
            .orElseThrow(() -> new RuntimeException("INTEGRITY-ERROR: Registration record " + id + " not found"));

        // DIV: PEL Integration
        policyService.enforceScope(
            actorUsername, 
            existing.getStudent().getDepartment() != null ? existing.getStudent().getDepartment().getId() : null,
            existing.getStudent().getCollege().getId()
        );

        // DIV: Business Invariant - Re-verify enrollment if session/semester changed
        if (!existing.getSession().equals(updated.getSession()) || !existing.getSemester().equals(updated.getSemester())) {
            boolean isEnrolled = semesterRegistrationRepository.existsByStudentAndSessionAndSemester(
                existing.getStudent(), updated.getSession(), updated.getSemester()
            );
            if (!isEnrolled) {
                throw new RuntimeException("BUSINESS-RULE-VIOLATION: Target session/semester lacks enrollment.");
            }
        }

        existing.setSession(updated.getSession());
        existing.setSemester(updated.getSemester());
        // level and other fields can be updated as long as DIV passes
        
        return registrationrepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteRegistration(Long id, String actorUsername) {
        Registration existing = registrationrepository.findById(id)
            .orElseThrow(() -> new RuntimeException("INTEGRITY-ERROR: Registration record " + id + " not found"));

        // DIV: PEL Integration
        policyService.enforceScope(
            actorUsername, 
            existing.getStudent().getDepartment() != null ? existing.getStudent().getDepartment().getId() : null,
            existing.getStudent().getCollege().getId()
        );

        registrationrepository.deleteById(id);
    }
}
