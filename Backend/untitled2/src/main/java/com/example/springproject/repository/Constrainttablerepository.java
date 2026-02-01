package com.example.springproject.repository;

import com.example.springproject.model.Constrainttable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface Constrainttablerepository extends JpaRepository<Constrainttable, Integer> {
    Constrainttable findTopByOrderByRecordDateDesc();
}
