package com.example.springproject.service;

import com.example.springproject.model.Course;
import com.example.springproject.model.Department;
import com.example.springproject.repository.Courserepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class Courseserviceimp implements Courseservice {
    
    @Autowired
    private Courserepository courserepository;

    @Autowired
    private PolicyEnforcementService policyService;

    @Override
    @Transactional
    public Course saveCourse(Course course, String actorUsername) {
        // DIV: Scope Verification
        policyService.enforceScope(
            actorUsername, 
            course.getDepartment().getId(),
            course.getDepartment().getCentre().getId()
        );

        if (courserepository.existsByCode(course.getCode())) {
            throw new RuntimeException("Course with code " + course.getCode() + " already exists.");
        }

        return courserepository.save(course);
    }

    @Override
    public List<Course> getAllCourses() {
        return courserepository.findAll();
    }

    @Override
    public List<Course> getCoursesByDepartment(Department department) {
        return courserepository.findByDepartment(department);
    }
    
    @Override
    public List<Course> getCoursesByCollege(Integer collegeId) {
        return courserepository.findByDepartmentCentreId(collegeId);
    }

    @Override
    @Transactional
    public Course updateCourse(Integer id, Course updated, String actorUsername) {
        Course existing = courserepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Course not found"));

        // DIV: Scope Verification
        policyService.enforceScope(
            actorUsername, 
            existing.getDepartment().getId(),
            existing.getDepartment().getCentre().getId()
        );

        existing.setCode(updated.getCode());
        existing.setTitle(updated.getTitle());
        existing.setUnit(updated.getUnit());
        existing.setSemester(updated.getSemester());
        existing.setExamType(updated.getExamType());
        existing.setEnrollmentCount(updated.getEnrollmentCount());
        existing.setLectureHours(updated.getLectureHours());
        existing.setTutorialHours(updated.getTutorialHours());
        existing.setPracticalHours(updated.getPracticalHours());
        existing.setDepartment(updated.getDepartment());
        
        return courserepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteCourse(Integer id, String actorUsername) {
        Course existing = courserepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Course not found"));

        // DIV: Scope Verification
        policyService.enforceScope(
            actorUsername, 
            existing.getDepartment().getId(),
            existing.getDepartment().getCentre().getId()
        );

        courserepository.deleteById(id);
    }
}
