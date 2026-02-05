package com.example.springproject.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class SchedulerServiceImpl implements SchedulerService {
    
    private static final Logger logger = LoggerFactory.getLogger(SchedulerServiceImpl.class);

    @Autowired
    private com.example.springproject.service.PeriodExclusionService periodExclusionService;

    @Autowired
    private com.example.springproject.repository.GeneralSettingsRepository generalSettingsRepository;

    @Autowired
    private com.example.springproject.repository.Constrainttablerepository constraintRepository;

    @Autowired
    private com.example.springproject.repository.PeriodExclusionSnapshotRepository exclusionRepository;

    @Autowired
    private com.example.springproject.service.Courseservice courseService;

    @Autowired
    private com.example.springproject.service.PeriodCalculationService periodCalculationService;

    @Override
    @Async
    public void triggerAlgorithm(Long generalSettingsId, Integer constraintId, Long exclusionSnapshotId) {
        logger.info("Scheduler Engine: Initialization Sequence Started...");
        
        try {
            // 1. Pull EXACT General Settings
            com.example.springproject.model.GeneralSettings settings = null;
            if (generalSettingsId != null) {
                settings = generalSettingsRepository.findById(generalSettingsId).orElse(null);
            } else {
                settings = generalSettingsRepository.findTopByOrderByIdDesc();
            }

            if (settings == null) {
                logger.error("Scheduler Engine: Aborted - GeneralSettings ID {} not found.", generalSettingsId);
                return;
            }

            // 2. Pull EXACT Constraints
            com.example.springproject.model.Constrainttable constraints = null;
            if (constraintId != null) {
                constraints = constraintRepository.findById(constraintId).orElse(null);
            } else {
                constraints = constraintRepository.findTopByOrderByRecordDateDesc();
            }

            // 3. Pull EXACT Exclusion Snapshot
            com.example.springproject.model.PeriodExclusionSnapshot exclusions = null;
            if (exclusionSnapshotId != null) {
                exclusions = exclusionRepository.findById(exclusionSnapshotId).orElse(null);
            } else {
                exclusions = periodExclusionService.getActiveByGeneralSettings(settings.getId());
            }

            int excludedCount = (exclusions != null) ? exclusions.getExcludedPeriodsList().size() : 0;
            
            // 4. CAPACITY PRE-FLIGHT CHECK (ALG-04 & ALG-06)
            com.example.springproject.dto.PeriodMappingResponse mapping = periodCalculationService.calculatePeriodMapping(settings);
            int totalPhysicalSlots = mapping.getTotalPeriods();
            int totalAvailableSlots = totalPhysicalSlots - excludedCount;
            
            long courseCount = courseService.getAllCourses().size();
            
            logger.info("Scheduler Engine: [CAPACITY ANALYSIS]");
            logger.info(" -> Total Grid Slots: {}", totalPhysicalSlots);
            logger.info(" -> Excluded Slots: {}", excludedCount);
            logger.info(" -> NET AVAILABLE SLOTS: {}", totalAvailableSlots);
            logger.info(" -> COURSES TO SCHEDULE: {}", courseCount);
            
            if (totalAvailableSlots < courseCount) {
                logger.error("Scheduler Engine: [ABORTED] - Insufficient capacity. Need {} slots, only {} available.", courseCount, totalAvailableSlots);
                // In a real scenario, we would update a status table here
                return;
            }

            logger.info("Scheduler Engine: [BUNDLE LOADED]");
            logger.info(" -> Settings ID: {} (Session: {})", settings.getId(), settings.getSession());
            logger.info(" -> Constraint ID: {}", (constraints != null ? constraints.getId() : "NONE"));
            logger.info(" -> Exclusion Snapshot ID: {} ({} periods)", (exclusions != null ? exclusions.getId() : "NONE"), excludedCount);

            // Simulation of long-running process
            logger.info("Scheduler Engine: Loading Constraints...");
            Thread.sleep(2000);
            
            logger.info("Scheduler Engine: Loading Course Data...");
            Thread.sleep(2000);
            
            logger.info("Scheduler Engine: Running Optimization (Genetic Hybrid)...");
            Thread.sleep(5000);
            
            logger.info("Scheduler Engine: Timetable Generation Completed Successfully.");
        } catch (InterruptedException e) {
            logger.error("Scheduler Engine: Interrupted", e);
            Thread.currentThread().interrupt();
        }
    }
}
