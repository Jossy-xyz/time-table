package com.example.springproject.controller;

import com.example.springproject.dto.StaffDto;
import com.example.springproject.model.Staff;
import com.example.springproject.model.Users;
import com.example.springproject.service.Staffservice;
import com.example.springproject.service.Userservice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/staff")
@CrossOrigin(origins = "http://localhost:3000")
public class Staffcontroller {
    
    @Autowired
    private Staffservice staffservice;

    @Autowired
    private Userservice userservice;

    @PostMapping("/post")
    public String add(@RequestBody Staff staff, @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorUsername) {
        staffservice.saveStaff(staff, actorUsername);
        return "Staff added successfully";
    }

    @PutMapping("/update/{id}")
    public StaffDto updateStaff(@PathVariable Integer id, @RequestBody Staff updatedStaff, @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorUsername) {
        Staff staff = staffservice.updateStaff(id, updatedStaff, actorUsername);
        return convertToDto(staff);
    }

    @GetMapping("/get")
    public List<StaffDto> getAllStaff(
            @RequestParam(value = "username", required = false) String usernameParam,
            @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        Users actor = userservice.getUserByUsername(actorUsername);
        
        if (actor == null) {
            System.err.println("Access denied: Actor not found - " + actorUsername);
            return List.of();
        }

        List<Staff> staffList;
        String role = (actor.getRole() != null) ? actor.getRole().getCode() : "UNKNOWN";
        
        if ("AD".equalsIgnoreCase(role)) {
            staffList = staffservice.getAllStaff();
        } else if ("CR".equalsIgnoreCase(role) && actor.getCollege() != null) {
            staffList = staffservice.getStaffByCollege(actor.getCollege().getId());
        } else if (actor.getDepartment() != null) {
            staffList = staffservice.getStaffByDepartment(actor.getDepartment());
        } else {
            staffList = List.of();
        }

        return staffList.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @DeleteMapping("/delete/{id}")
    public String deleteStaff(@PathVariable Integer id, @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorUsername) {
        staffservice.deleteStaff(id, actorUsername);
        return "Staff deleted successfully";
    }

    private StaffDto convertToDto(Staff staff) {
        StaffDto dto = new StaffDto();
        dto.setId(staff.getId());
        dto.setStaffId(staff.getStaffId());
        dto.setTitle(staff.getTitle());
        dto.setSurname(staff.getSurname());
        dto.setFirstname(staff.getFirstname());
        dto.setMiddlename(staff.getMiddlename());
        dto.setStatusId(staff.getStatusId());
        dto.setInUse(staff.getInUse() != null && staff.getInUse() == 1);
        dto.setDutyCount(staff.getDutyCount());
        dto.setCollegeId(staff.getCollege() != null ? staff.getCollege().getId() : null);
        return dto;
    }
}
