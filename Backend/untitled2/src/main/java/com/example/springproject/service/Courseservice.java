package com.example.springproject.service;

import com.example.springproject.model.Course;
import com.example.springproject.model.Department;
import java.util.List;

public interface Courseservice {
    Course saveCourse(Course course, String actorUsername);
    List<Course> getAllCourses();
    Course updateCourse(String id, Course updatedCourse, String actorUsername);
    void deleteCourse(String id, String actorUsername);
}
