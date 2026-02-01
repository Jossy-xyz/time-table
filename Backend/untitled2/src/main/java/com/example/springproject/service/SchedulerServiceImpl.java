package com.example.springproject.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class SchedulerServiceImpl implements SchedulerService {
    
    private static final Logger logger = LoggerFactory.getLogger(SchedulerServiceImpl.class);

    @Override
    @Async
    public void triggerAlgorithm() {
        logger.info("Scheduler Engine: Initialization Sequence Started...");
        
        try {
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
