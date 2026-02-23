package com.example.springproject.service;

import com.example.springproject.model.Examtab;
import java.util.List;

public interface Examtabservice {
    Examtab saveExamtab(Examtab examtab, String actorUsername);
    List<Examtab> getAllExamtabs();
}
