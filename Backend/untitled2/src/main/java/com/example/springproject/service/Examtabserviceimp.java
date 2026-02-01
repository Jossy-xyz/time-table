package com.example.springproject.service;

import com.example.springproject.model.Examtab;
import com.example.springproject.repository.Examtabrepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class Examtabserviceimp implements Examtabservice {
    @Autowired
    private Examtabrepository examtabRepository;

    @Override
    public Examtab saveExamtab(Examtab examtab) {
        return examtabRepository.save(examtab);
    }

    @Override
    public List<Examtab> getAllExamtabs() {
        return examtabRepository.findAll();
    }
}
