package com.example.springproject.controller;

import com.example.springproject.dto.DepartmentDto;
import com.example.springproject.model.Department;
import com.example.springproject.model.Users;
import com.example.springproject.service.Departmentservice;
import com.example.springproject.service.Userservice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/department")
@CrossOrigin(origins = "http://localhost:3000")
public class Departmentcontroller {
    @Autowired
    private Departmentservice departmentservice;

    @Autowired
    private Userservice userservice;

    @PostMapping("/post")
    public String add(@RequestBody Department department, @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorUsername) {
        departmentservice.saveDepartment(department, actorUsername);
        return "Department added successfully";
    }

    @PutMapping("/update/{id}")
    public DepartmentDto updateDepartment(@PathVariable int id, @RequestBody Department updatedDepartment, @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorUsername) {
        Department dept = departmentservice.updateDepartment(id, updatedDepartment, actorUsername);
        return convertToDto(dept);
    }

    @GetMapping("/get")
    public List<DepartmentDto> getAllDepartments(
            @RequestParam(value = "username", required = false) String usernameParam,
            @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        Users actor = userservice.getUserByUsername(actorUsername);
        
        if (actor == null) {
            System.err.println("Access denied: Actor not found - " + actorUsername);
            return List.of();
        }

        List<Department> departments;
        
        if (actor.getRole() != null && "AD".equalsIgnoreCase(actor.getRole().getCode())) {
            departments = departmentservice.getAllDepartments();
        } else if (actor.getCollege() != null) {
            // College Rep gets all depts in their college
            departments = departmentservice.getAllDepartments().stream()
                .filter(d -> d.getCentre() != null && d.getCentre().getId().equals(actor.getCollege().getId()))
                .collect(Collectors.toList());
        } else {
            departments = List.of();
        }

        return departments.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @DeleteMapping("/delete/{id}")
    public String deleteDepartment(@PathVariable int id, @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorUsername) {
        departmentservice.deleteDepartment(id, actorUsername);
        return "Department deleted successfully";
    }

    private DepartmentDto convertToDto(Department dept) {
        DepartmentDto dto = new DepartmentDto();
        dto.setId(dept.getId());
        dto.setCode(dept.getCode());
        dto.setName(dept.getName());
        dto.setCentreId(dept.getCentre() != null ? dept.getCentre().getId() : null);
        return dto;
    }
}
