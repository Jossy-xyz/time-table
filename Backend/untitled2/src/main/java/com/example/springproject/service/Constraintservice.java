package com.example.springproject.service;

import com.example.springproject.model.Constrainttable;
import java.util.List;

public interface Constraintservice {
    Constrainttable saveConstrainttable(Constrainttable constrainttable);
    List<Constrainttable> getAllConstraints();
}
