package com.example.springproject.service;

import com.example.springproject.model.Program;
import java.util.List;

public interface Programservice {
    Program saveProgram(Program program, String actorUsername);
    List<Program> getAllPrograms();
    Program updateProgram(Integer id, Program updateProgram, String actorUsername);
    void deleteProgram(Integer id, String actorUsername);
}
