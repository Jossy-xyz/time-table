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
        
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        Users actor = userservice.getUserByUsername(actorUsername);
        
        if (actor == null) {
            System.err.println("Access denied: Actor not found - " + actorUsername);
            return List.of();
        }

        List<Course> courses;
        String role = (actor.getRole() != null) ? actor.getRole().getCode() : "UNKNOWN";
        
        if ("AD".equalsIgnoreCase(role)) {
            courses = courseservice.getAllCourses();
        } else if ("CR".equalsIgnoreCase(role) && actor.getCollege() != null) {
            courses = courseservice.getCoursesByCollege(actor.getCollege().getId());
        } else if (actor.getDepartment() != null) {
            courses = courseservice.getCoursesByDepartment(actor.getDepartment());
        } else {
            courses = List.of();
        }

        return courses.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @PutMapping("/update/{id}")
    public CourseDto updateCourse(@PathVariable Integer id, @RequestBody Course updatedCourse, @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorUsername) {
        Course course = courseservice.updateCourse(id, updatedCourse, actorUsername);
        return convertToDto(course);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteCourse(@PathVariable Integer id, @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorUsername) {
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
        dto.setExamType(course.getExamType());
        dto.setEnrollmentCount(course.getEnrollmentCount());
        dto.setLectureHours(course.getLectureHours());
        dto.setTutorialHours(course.getTutorialHours());
        dto.setPracticalHours(course.getPracticalHours());
        dto.setDepartmentId(course.getDepartment() != null ? course.getDepartment().getId() : null);
        return dto;
    }
}
