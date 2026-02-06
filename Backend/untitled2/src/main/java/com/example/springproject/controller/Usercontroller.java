package com.example.springproject.controller;

import com.example.springproject.model.Users;
import com.example.springproject.service.Userservice;
import com.example.springproject.dto.LoginResponse;
import com.example.springproject.dto.UserDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000")
public class Usercontroller {

    @Autowired
    private Userservice userservice;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public UserDto register(@RequestBody Users user) {
        Users saved = userservice.saveUser(user);
        return convertToDto(saved);
    }

    @GetMapping("/all")
    public List<UserDto> getAllUsers() {
        return userservice.getAllUsers().stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserDto> getUser(@PathVariable String username) {
        Users user = userservice.getUserByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToDto(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Users loginRequest) {
        try {
            System.out.println("Login attempt for username: " + loginRequest.getUsername());
            Users user = userservice.getUserByUsername(loginRequest.getUsername());
            
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
            }
            
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                LoginResponse response = new LoginResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole() != null ? user.getRole().getId() : null,
                    user.getRole() != null ? user.getRole().getCode() : null,
                    user.getCollege() != null ? user.getCollege().getId() : null,
                    user.getDepartment() != null ? user.getDepartment().getId() : null
                );
                System.out.println("Login successful for user: " + user.getUsername() + " (ID: " + user.getId() + ")");
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        } catch (Exception e) {
            System.err.println("Login error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error during login: " + e.getMessage());
        }
    }

    private UserDto convertToDto(Users user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setRoleId(user.getRole() != null ? user.getRole().getId() : null);
        dto.setRoleCode(user.getRole() != null ? user.getRole().getCode() : null);
        dto.setCollegeId(user.getCollege() != null ? user.getCollege().getId() : null);
        dto.setDepartmentId(user.getDepartment() != null ? user.getDepartment().getId() : null);
        dto.setStaffId(user.getStaff() != null ? user.getStaff().getId() : null);
        dto.setEmail(user.getEmail());
        return dto;
    }
}
