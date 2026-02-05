package com.example.springproject.service;

public interface SchedulerService {
    void triggerAlgorithm(Long generalSettingsId, Integer constraintId, Long exclusionSnapshotId);
}
