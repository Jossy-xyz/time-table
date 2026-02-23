package com.example.springproject.controller;

import com.example.springproject.dto.CourseDto;
import com.example.springproject.model.Course;
import com.example.springproject.model.Users;
import com.example.springproject.service.Courseservice;
import com.example.springproject.service.Userservice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.io.FileWriter;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/course")
public class Coursecontroller {

    @Autowired
    private Courseservice courseservice;

    @Autowired
    private Userservice userservice;

    @PostMapping("/done")
    public String add(@RequestBody Course course, @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorUsername) {
        courseservice.saveCourse(course, actorUsername);
        return "Course added successfully";
    }

    @GetMapping("/get")
    public List<CourseDto> getAllCourses(
            @RequestParam(value = "username", required = false) String usernameParam,
            @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        try {
            // DIV: Universal access because course table is not scoped in this DB version
            List<Course> courses = courseservice.getAllCourses();
            return courses.stream().map(this::convertToDto).collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("CRITICAL FAULT IN Coursecontroller.getAllCourses: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("CONTROLLER-ERROR: " + e.getMessage(), e);
        }
    }

    @PutMapping("/update/{id}")
    public CourseDto updateCourse(@PathVariable String id, @RequestBody Course updatedCourse, @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorUsername) {
        Course course = courseservice.updateCourse(id, updatedCourse, actorUsername);
        return convertToDto(course);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteCourse(@PathVariable String id, @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorUsername) {
        courseservice.deleteCourse(id, actorUsername);
        return "Course deleted successfully";
    }

    private CourseDto convertToDto(Course course) {
        CourseDto dto = new CourseDto();
        dto.setId(course.getId());
        dto.setCode(course.getCode());
        dto.setTitle(course.getTitle());
        dto.setUnit(course.getUnit());
        dto.setSemester(course.getSemester());
        dto.setEnrollmentCount(course.getEnrollmentCount());
        return dto;
    }
}
