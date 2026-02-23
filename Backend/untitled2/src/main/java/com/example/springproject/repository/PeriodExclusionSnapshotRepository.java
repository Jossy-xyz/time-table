package com.example.springproject.repository;

import com.example.springproject.model.PeriodExclusionSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PeriodExclusionSnapshotRepository extends JpaRepository<PeriodExclusionSnapshot, Long> {
    
    Optional<PeriodExclusionSnapshot> findByGeneralSettingsIdAndIsActive(Long generalSettingsId, Integer isActive);
    
    List<PeriodExclusionSnapshot> findByGeneralSettingsIdOrderByCreatedAtDesc(Long generalSettingsId);
    
    @Modifying
    @Query("UPDATE PeriodExclusionSnapshot p SET p.isActive = 0 WHERE p.generalSettings.id = :generalSettingsId")
    void deactivateAllByGeneralSettingsId(@Param("generalSettingsId") Long generalSettingsId);
}
