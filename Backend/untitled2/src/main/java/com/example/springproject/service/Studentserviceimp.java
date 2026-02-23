package com.example.springproject.service;

import com.example.springproject.model.Student;
import com.example.springproject.model.Department;
import com.example.springproject.repository.Studentrepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class Studentserviceimp implements Studentservice {

    @Autowired
    private Studentrepository studentrepository;

    @Autowired
    private PolicyEnforcementService policyService;

    @Override
    @Transactional
    public Student saveStudent(Student student, String actorUsername) {
        // DIV-01: Integrity Enforcement - Verify FK inputs
        if (student.getCollege() == null || student.getCollege().getId() == null) {
            throw new IllegalArgumentException("DIV-VIOLATION: Student MUST be assigned to a College (cenID)");
        }

        // DIV-02: Mandatory Pre-Mutation Check - Natural Key uniqueness
        if (studentrepository.existsByMatricNo(student.getMatricNo())) {
            throw new RuntimeException("INTEGRITY-ERROR: Student with Matric No " + student.getMatricNo() + " already exists.");
        }

        // DIV-03: PEL Integration - Hierarchy defines scope
        policyService.enforceScope(
            actorUsername, 
            student.getDepartment() != null ? student.getDepartment().getId() : null,
            student.getCollege().getId()
        );

        return studentrepository.save(student);
    }

    @Override
    public List<Student> getAllStudents() {
        return studentrepository.findAll();
    }

    @Override
    public List<Student> getStudentsByDepartment(Department department) {
        return studentrepository.findByDepartment(department);
    }

    @Override
    public List<Student> getStudentsByCollege(Integer collegeId) {
        return studentrepository.findByCollegeId(collegeId);
    }

    @Override
    @Transactional
    public Student updateStudent(String id, Student updated, String actorUsername) {
        // DIV: Fetch Managed Instance
        Student existing = studentrepository.findById(id)
            .orElseThrow(() -> new RuntimeException("INTEGRITY-ERROR: Student " + id + " not found"));

        // DIV: PEL Integration
        policyService.enforceScope(
            actorUsername, 
            existing.getDepartment() != null ? existing.getDepartment().getId() : null,
            existing.getCollege().getId()
        );

        // DIV: Strict Sanitization & Update
        if (updated.getMatricNo() != null) existing.setMatricNo(updated.getMatricNo());
        if (updated.getFullName() != null) existing.setFullName(updated.getFullName());
        if (updated.getLevel() != null) existing.setLevel(updated.getLevel());
        if (updated.getProgramme() != null) existing.setProgramme(updated.getProgramme());
        if (updated.getDepartment() != null) existing.setDepartment(updated.getDepartment());
        if (updated.getCollege() != null) existing.setCollege(updated.getCollege());
        
        return studentrepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteStudent(String id, String actorUsername) {
        // DIV: Fetch Managed Instance
        Student existing = studentrepository.findById(id)
            .orElseThrow(() -> new RuntimeException("INTEGRITY-ERROR: Student " + id + " not found"));

        // DIV: PEL Integration
        policyService.enforceScope(
            actorUsername, 
            existing.getDepartment() != null ? existing.getDepartment().getId() : null,
            existing.getCollege().getId()
        );

        studentrepository.deleteById(id);
    }
}
