package com.example.springproject.controller;

import com.example.springproject.dto.RegistrationDto;
import com.example.springproject.model.Registration;
import com.example.springproject.service.Registrationservice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/registration")
@CrossOrigin("http://localhost:3000")
public class Registrationcontroller {
    
    @Autowired
    private Registrationservice registrationservice;

    @PostMapping("/post")
    public String add(@RequestBody Registration registration, 
                     @RequestParam(value = "username", required = false) String usernameParam,
                     @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        registrationservice.saveRegistration(registration, actorUsername);
        return "Registration successful";
    }
 
    @PutMapping("/update/{id}")
    public RegistrationDto updateRegistration(@PathVariable Long id, @RequestBody Registration updatedRegistration, 
                                             @RequestParam(value = "username", required = false) String usernameParam,
                                             @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        Registration reg = registrationservice.updateRegistration(id, updatedRegistration, actorUsername);
        return convertToDto(reg);
    }
 
    @GetMapping("/get")
    public List<RegistrationDto> getAllRegistration(@RequestParam(value = "username", required = false) String usernameParam,
                                                   @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        return registrationservice.getAllRegistration().stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
 
    @DeleteMapping("/delete/{id}")
    public String deleteRegistration(@PathVariable Long id, 
                                    @RequestParam(value = "username", required = false) String usernameParam,
                                    @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        registrationservice.deleteRegistration(id, actorUsername);
        return "Registration deleted successfully";
    }

    private RegistrationDto convertToDto(Registration reg) {
        RegistrationDto dto = new RegistrationDto();
        dto.setId(reg.getId());
        dto.setStudentId(reg.getStudent() != null ? reg.getStudent().getId() : null);
        dto.setCourseId(reg.getCourse() != null ? reg.getCourse().getId() : null);
        dto.setSession(reg.getSession());
        dto.setSemester(reg.getSemester());
        return dto;
    }
}
