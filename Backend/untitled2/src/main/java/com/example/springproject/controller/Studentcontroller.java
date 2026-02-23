package com.example.springproject.controller;

import com.example.springproject.dto.StudentDto;
import com.example.springproject.model.Student;
import com.example.springproject.model.Users;
import com.example.springproject.service.Studentservice;
import com.example.springproject.service.Userservice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/student")
@CrossOrigin(origins = "http://localhost:3000")
public class Studentcontroller {

    @Autowired
    private Studentservice studentservice;

    @Autowired
    private Userservice userservice;

    @GetMapping("/get")
    public List<StudentDto> getAllStudents(
            @RequestParam(value = "username", required = false) String usernameParam,
            @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        Users actor = userservice.getUserByUsername(actorUsername);
        
        if (actor == null) {
            System.err.println("Access denied: Actor not found - " + actorUsername);
            return List.of();
        }

        List<Student> students;
        String role = (actor.getRole() != null) ? actor.getRole().getCode() : "UNKNOWN";
        
        if ("AD".equalsIgnoreCase(role)) {
            students = studentservice.getAllStudents();
        } else if ("CR".equalsIgnoreCase(role) && actor.getCollege() != null) {
            students = studentservice.getStudentsByCollege(actor.getCollege().getId());
        } else if (actor.getDepartment() != null) {
            students = studentservice.getStudentsByDepartment(actor.getDepartment());
        } else {
            students = List.of();
        }

        return students.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @PostMapping("/post")
    public String add(@RequestBody Student student, @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorUsername) {
        studentservice.saveStudent(student, actorUsername);
        return "Student added successfully";
    }

    @PutMapping("/update/{id:.+}")
    public StudentDto updateStudent(@PathVariable String id, @RequestBody Student updatedStudent, @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorUsername) {
        Student student = studentservice.updateStudent(id, updatedStudent, actorUsername);
        return convertToDto(student);
    }

    @DeleteMapping("/delete/{id:.+}")
    public String deleteStudent(@PathVariable String id, @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorUsername) {
        studentservice.deleteStudent(id, actorUsername);
        return "Student deleted successfully";
    }

    private StudentDto convertToDto(Student student) {
        StudentDto dto = new StudentDto();
        dto.setId(student.getId()); // Natural Key (matricNo)
        dto.setMatricNo(student.getMatricNo());
        dto.setFullName(student.getFullName());
        dto.setLevel(student.getLevel());
        dto.setDepartmentId(student.getDepartment() != null ? student.getDepartment().getId() : null);
        dto.setCollegeId(student.getCollege() != null ? student.getCollege().getId() : null);
        dto.setProgramme(student.getProgramme());
        return dto;
    }
}
