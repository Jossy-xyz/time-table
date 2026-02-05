package com.example.springproject.controller;

import com.example.springproject.dto.ProgramDto;
import com.example.springproject.model.Program;
import com.example.springproject.service.Programservice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/program")
@CrossOrigin(origins = "http://localhost:3000")
public class Programcontroller {
    @Autowired
    private Programservice programservice;

    @PostMapping("/post")
    public String add(@RequestBody Program program, 
                     @RequestParam(value = "username", required = false) String usernameParam,
                     @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        programservice.saveProgram(program, actorUsername);
        return "Program added successfully";
    }

    @PutMapping("/update/{id}")
    public ProgramDto updateProgram(@PathVariable Integer id, @RequestBody Program updatedProgram, 
                                   @RequestParam(value = "username", required = false) String usernameParam,
                                   @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        Program program = programservice.updateProgram(id, updatedProgram, actorUsername);
        return convertToDto(program);
    }

    @GetMapping("/get")
    public List<ProgramDto> getAllPrograms(@RequestParam(value = "username", required = false) String usernameParam,
                                          @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        return programservice.getAllPrograms().stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    @DeleteMapping("/delete/{id}")
    public String deleteProgram(@PathVariable Integer id, 
                               @RequestParam(value = "username", required = false) String usernameParam,
                               @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        programservice.deleteProgram(id, actorUsername);
        return "Program deleted successfully";
    }

    private ProgramDto convertToDto(Program program) {
        ProgramDto dto = new ProgramDto();
        dto.setId(program.getId());
        dto.setDepartmentId(program.getDepartment() != null ? program.getDepartment().getId() : null);
        dto.setCode(program.getCode());
        dto.setName(program.getName());
        dto.setDuration(program.getDuration());
        dto.setTotalCompulsoryUnits(program.getTotalCompulsoryUnits());
        dto.setTotalRequiredUnits(program.getTotalRequiredUnits());
        dto.setMinElectiveUnits(program.getMinElectiveUnits());
        dto.setEntryRequirements(program.getEntryRequirements());
        return dto;
    }
}
