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
        // DIV-02: Mandatory Pre-Mutation Check - Natural Key uniqueness
        if (courserepository.existsByCode(course.getCode())) {
            throw new RuntimeException("INTEGRITY-ERROR: Course with code " + course.getCode() + " already exists.");
        }

        // DIV: Scope Enforced at Controller or Generic Level
        return courserepository.save(course);
    }

    @Override
    public List<Course> getAllCourses() {
        try {
            return courserepository.findAll();
        } catch (Exception e) {
            System.err.println("SERVICE-FAULT IN Courseserviceimp.getAllCourses: " + e.getMessage());
            throw new RuntimeException("SERVICE-ERROR: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public Course updateCourse(String id, Course updated, String actorUsername) {
        // DIV: Fetch Managed Instance
        Course existing = courserepository.findById(id)
            .orElseThrow(() -> new RuntimeException("INTEGRITY-ERROR: Course " + id + " not found"));

        // DIV: Strict Sanitization & Update
        if (updated.getCode() != null) existing.setCode(updated.getCode());
        if (updated.getTitle() != null) existing.setTitle(updated.getTitle());
        if (updated.getUnit() != null) existing.setUnit(updated.getUnit());
        if (updated.getSemester() != null) existing.setSemester(updated.getSemester());
        if (updated.getEnrollmentCount() != null) existing.setEnrollmentCount(updated.getEnrollmentCount());
        
        return courserepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteCourse(String id, String actorUsername) {
        // DIV: Fetch Managed Instance
        Course existing = courserepository.findById(id)
            .orElseThrow(() -> new RuntimeException("INTEGRITY-ERROR: Course " + id + " not found"));

        courserepository.deleteById(id);
    }
}
