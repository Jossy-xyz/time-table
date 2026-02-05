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
        // DIV: Scope Verification
        policyService.enforceScope(
            actorUsername, 
            student.getDepartment().getId(),
            student.getDepartment().getCentre().getId()
        );

        if (studentrepository.existsByMatricNo(student.getMatricNo())) {
            throw new RuntimeException("Student with Matric No " + student.getMatricNo() + " already exists.");
        }

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
        return studentrepository.findByDepartmentCentreId(collegeId);
    }

    @Override
    @Transactional
    public Student updateStudent(Integer id, Student updated, String actorUsername) {
        Student existing = studentrepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found"));

        // DIV: Scope Verification
        policyService.enforceScope(
            actorUsername, 
            existing.getDepartment().getId(),
            existing.getDepartment().getCentre().getId()
        );

        existing.setMatricNo(updated.getMatricNo());
        existing.setSurname(updated.getSurname());
        existing.setFirstname(updated.getFirstname());
        existing.setMiddlename(updated.getMiddlename());
        existing.setLevel(updated.getLevel());
        existing.setGender(updated.getGender());
        existing.setStartSession(updated.getStartSession());
        existing.setProgrammeName(updated.getProgrammeName());
        existing.setDepartment(updated.getDepartment());
        existing.setProgram(updated.getProgram());
        
        return studentrepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteStudent(Integer id, String actorUsername) {
        Student existing = studentrepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found"));

        // DIV: Scope Verification
        policyService.enforceScope(
            actorUsername, 
            existing.getDepartment().getId(),
            existing.getDepartment().getCentre().getId()
        );

        studentrepository.deleteById(id);
    }
}
