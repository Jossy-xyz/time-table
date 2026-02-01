package com.example.springproject.service;

import com.example.springproject.model.Examtab;
import java.util.List;

public interface Examtabservice {
    Examtab saveExamtab(Examtab examtab);
    List<Examtab> getAllExamtabs();
}
