package com.example.springproject.controller;

import com.example.springproject.model.Examtab;
import com.example.springproject.service.Examtabservice;
import com.example.springproject.service.PolicyEnforcementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/examtab")
@CrossOrigin(origins = "http://localhost:3000")
public class Examtabcontroller {
    @Autowired
    private Examtabservice examtabservice;

    @Autowired
    private PolicyEnforcementService policyService;

    @PostMapping("/post")
    public String add(@RequestBody Examtab examtab, 
                     @RequestParam(value = "username", required = false) String usernameParam,
                     @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        String actorUsername = (usernameParam != null) ? usernameParam : actorHeader;
        examtabservice.saveExamtab(examtab, actorUsername);
        return "Exam tab settings saved";
    }

    @GetMapping("/get")
    public List<Examtab> getAll(@RequestParam(value = "username", required = false) String usernameParam,
                               @RequestHeader(value = "X-Actor-Username", defaultValue = "admin") String actorHeader) {
        return examtabservice.getAllExamtabs();
    }
}
