package com.example.springproject.repository;

import com.example.springproject.model.GeneralSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GeneralSettingsRepository extends JpaRepository<GeneralSettings, Long> {
    // Usually only one row exists, so findTopByOrderByIdDesc or similar is used
    GeneralSettings findTopByOrderByIdDesc();
}
