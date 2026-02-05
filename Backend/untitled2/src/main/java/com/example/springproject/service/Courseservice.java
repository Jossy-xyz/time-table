package com.example.springproject.service;

import com.example.springproject.model.Course;
import com.example.springproject.model.Department;
import java.util.List;

public interface Courseservice {
    Course saveCourse(Course course, String actorUsername);
    List<Course> getAllCourses();
    List<Course> getCoursesByDepartment(Department department);
    List<Course> getCoursesByCollege(Integer collegeId);
    Course updateCourse(Integer id, Course updatedCourse, String actorUsername);
    void deleteCourse(Integer id, String actorUsername);
}
