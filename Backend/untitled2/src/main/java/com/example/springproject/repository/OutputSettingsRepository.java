package com.example.springproject.repository;

import com.example.springproject.model.OutputSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OutputSettingsRepository extends JpaRepository<OutputSettings, Integer> {
    OutputSettings findTopByOrderByIdDesc();
}
