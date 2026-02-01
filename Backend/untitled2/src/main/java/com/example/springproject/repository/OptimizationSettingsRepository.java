package com.example.springproject.repository;

import com.example.springproject.model.OptimizationSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OptimizationSettingsRepository extends JpaRepository<OptimizationSettings, Integer> {
}
