package com.example.springproject.service;

import com.example.springproject.model.Constrainttable;
import com.example.springproject.repository.Constrainttablerepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class Constraintserviceimp implements Constraintservice {
    @Autowired
    private Constrainttablerepository constraintRepository;

    @Override
    public Constrainttable saveConstrainttable(Constrainttable constrainttable) {
        return constraintRepository.save(constrainttable);
    }

    @Override
    public List<Constrainttable> getAllConstraints() {
        return constraintRepository.findAll();
    }
}
