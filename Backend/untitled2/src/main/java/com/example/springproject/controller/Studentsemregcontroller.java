package com.example.springproject.controller;

import com.example.springproject.dto.StudentSemesterRegistrationDto;
import com.example.springproject.model.StudentSemesterRegistration;
import com.example.springproject.service.StudentSemesterRegistrationservice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/sem")
@CrossOrigin(origins = "http://localhost:3000")
public class Studentsemregcontroller {
    
    @Autowired
    private StudentSemesterRegistrationservice service;

    @PostMapping("/reg")
    public String add(@RequestBody StudentSemesterRegistration registration, 
                     @RequestParam(value = "username", required = false) String usernameParam,
                     @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        service.saveStudentSemesterRegistration(registration, actorUsername);
        return "Student semester registered successfully";
    }

    @PutMapping("/update/{id}")
    public StudentSemesterRegistrationDto updateStudentsem(@PathVariable Long id, @RequestBody StudentSemesterRegistration registration, 
                                                          @RequestParam(value = "username", required = false) String usernameParam,
                                                          @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        StudentSemesterRegistration reg = service.updateStudentSemesterRegistration(id, registration, actorUsername);
        return convertToDto(reg);
    }

    @GetMapping("/get")
    public List<StudentSemesterRegistrationDto> getAllStudentsem(@RequestParam(value = "username", required = false) String usernameParam,
                                                                @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        return service.getAllStudentSemesterRegistrations().stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    @DeleteMapping("/delete/{id}")
    public String deleteStudentsem(@PathVariable Long id, 
                                @RequestParam(value = "username", required = false) String usernameParam,
                                @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        service.deleteStudentSemesterRegistration(id, actorUsername);
        return "Student semester registration deleted successfully";
    }

    private StudentSemesterRegistrationDto convertToDto(StudentSemesterRegistration reg) {
        StudentSemesterRegistrationDto dto = new StudentSemesterRegistrationDto();
        dto.setId(reg.getId());
        dto.setStudentId(reg.getStudent() != null ? reg.getStudent().getId() : null);
        dto.setSession(reg.getSession());
        dto.setSemester(reg.getSemester());
        dto.setLevel(reg.getLevel());
        return dto;
    }
}
