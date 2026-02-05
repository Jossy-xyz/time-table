-- Refactored Schema (Institutional DBA Optimized v8)
-- Full Cleanup & Structure Setup
-- Enhanced Foreign Key Constraints for Total Integrity

-- 1. INITIALIZATION
CREATE DATABASE IF NOT EXISTS `examtt` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `examtt`;

-- FORCIBLY DISABLE CHECKS
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

-- 2. TOTAL CLEANUP 
DROP TABLE IF EXISTS `registration`;
DROP TABLE IF EXISTS `course_registrations`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `studentsemreg`;
DROP TABLE IF EXISTS `examtt`;
DROP TABLE IF EXISTS `student`;
DROP TABLE IF EXISTS `staff`;
DROP TABLE IF EXISTS `course`;
DROP TABLE IF EXISTS `slashedcourse`;
DROP TABLE IF EXISTS `venue`;
DROP TABLE IF EXISTS `program`;
DROP TABLE IF EXISTS `department`;
DROP TABLE IF EXISTS `centre`;
DROP TABLE IF EXISTS `algorithm tab`;
DROP TABLE IF EXISTS `constraint table`;
DROP TABLE IF EXISTS `optimization settings`;
DROP TABLE IF EXISTS `output tab`;
DROP TABLE IF EXISTS `main interface`;
DROP TABLE IF EXISTS `examtab`;

-- 3. STRUCTURAL SETUP (ROOT UPWARDS)
-- --------------------------------------------------------

-- Level 0 (No dependencies)
CREATE TABLE `centre` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `type` int(11) NOT NULL DEFAULT 1,
  `encount` int(11) NOT NULL DEFAULT 0,
  `state` varchar(100) DEFAULT NULL, 
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_centre_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Level 1 (Depends on Centre)
CREATE TABLE `department` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `college_id` int(11) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_dept_code` (`code`),
  CONSTRAINT `fk_dept_centre` FOREIGN KEY (`college_id`) REFERENCES `centre` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `venue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `college_id` int(11) NOT NULL,
  `venue_code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `Capacity` int(11) NOT NULL,
  `Type` int(2) NOT NULL DEFAULT 0,
  `Preference` int(11) NOT NULL DEFAULT 1,
  `location` varchar(255) DEFAULT NULL,
  `actual_capacity` int(11) DEFAULT 0,
  `in_use` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_ven_code` (`venue_code`),
  CONSTRAINT `fk_ven_centre` FOREIGN KEY (`college_id`) REFERENCES `centre` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Level 2 (Depends on Department)
CREATE TABLE `program` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dept_id` int(11) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `new_codeid` int(11) NOT NULL DEFAULT 0,
  `duration` int(11) DEFAULT 4,
  `total_comp_units` int(11) DEFAULT 0,
  `total_req_units` int(11) DEFAULT 0,
  `min_elective_units` int(11) DEFAULT 0,
  `entry_req` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_prog_code` (`code`),
  CONSTRAINT `fk_prog_dept` FOREIGN KEY (`dept_id`) REFERENCES `department` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `course` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `college_id` int(11) NOT NULL,
  `dept_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `unit` int(11) NOT NULL DEFAULT 0,
  `semester` int(2) NOT NULL DEFAULT 1,
  `examtype` int(2) NOT NULL DEFAULT 2,
  `en_count` int(11) NOT NULL DEFAULT 0,
  `lecture_hours` int(11) DEFAULT 0,
  `tutorial_hours` int(11) DEFAULT 0,
  `practical_hours` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_crs_code` (`code`),
  CONSTRAINT `fk_crs_centre` FOREIGN KEY (`college_id`) REFERENCES `centre` (`id`),
  CONSTRAINT `fk_crs_dept` FOREIGN KEY (`dept_id`) REFERENCES `department` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `staff` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dept_id` int(11) DEFAULT NULL,
  `staff_id` varchar(50) NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `surname` varchar(255) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `middlename` varchar(255) DEFAULT NULL,
  `statusID` int(11) DEFAULT 1,
  `type` int(11) DEFAULT 1,
  `in_use` int(11) DEFAULT 1,
  `duty_count` int(11) DEFAULT 0,
  `specialization` varchar(255) DEFAULT NULL,
  `research_area` varchar(255) DEFAULT NULL,
  `discipline` varchar(255) DEFAULT NULL,
  `short_name` varchar(50) DEFAULT NULL,
  `serial_no` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_staff_code` (`staff_id`),
  CONSTRAINT `fk_stf_dept` FOREIGN KEY (`dept_id`) REFERENCES `department` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Level 3 (Depends on Program/Department/Staff)
CREATE TABLE `student` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `dept_id` int(11) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `matric_no` varchar(50) NOT NULL,
  `surname` varchar(255) NOT NULL,
  `firstname` varchar(255) NOT NULL,
  `middlename` varchar(255) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `start_session` varchar(20) DEFAULT NULL,
  `level` int(11) NOT NULL DEFAULT 100,
  `programme_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `idx_std_matric` (`matric_no`),
  CONSTRAINT `fk_std_dept` FOREIGN KEY (`dept_id`) REFERENCES `department` (`id`),
  CONSTRAINT `fk_std_prog` FOREIGN KEY (`program_id`) REFERENCES `program` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `college_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `staff_id` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_usr_name` (`username`),
  CONSTRAINT `fk_usr_college` FOREIGN KEY (`college_id`) REFERENCES `centre` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_usr_dept` FOREIGN KEY (`department_id`) REFERENCES `department` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_usr_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Level 4 (Transactional/Mappings)
CREATE TABLE `registration` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `centre_id` int(11) NOT NULL,
  `regDMC` int(20) NOT NULL,
  `matricno` varchar(50) NOT NULL,
  `course_code` varchar(20) NOT NULL,
  `session` varchar(20) NOT NULL,
  `semester` int(2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_unique_reg` (`matricno`, `course_code`, `session`),
  CONSTRAINT `fk_reg_std` FOREIGN KEY (`matricno`) REFERENCES `student` (`matric_no`) ON DELETE CASCADE,
  CONSTRAINT `fk_reg_crs` FOREIGN KEY (`course_code`) REFERENCES `course` (`code`) ON DELETE CASCADE,
  CONSTRAINT `fk_reg_centre` FOREIGN KEY (`centre_id`) REFERENCES `centre` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Settings
CREATE TABLE `algorithm tab` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `algorithm_name` varchar(255) DEFAULT NULL,
  `param_name` varchar(255) DEFAULT NULL,
  `value` varchar(255) DEFAULT NULL,
  `checked` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `constraint table` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `details` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `optimization settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `display_progress` tinyint(1) NOT NULL DEFAULT 1,
  `opt_time` varchar(255) DEFAULT NULL,
  `opt_cycle_count` int(11) NOT NULL DEFAULT 0,
  `int_mode` tinyint(1) NOT NULL DEFAULT 0,
  `add_more_time` tinyint(1) NOT NULL DEFAULT 0,
  `exam_w_time` tinyint(1) NOT NULL DEFAULT 1,
  `exam_w_cycle` tinyint(1) NOT NULL DEFAULT 1,
  `exam_w_both` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `output tab` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mix_exams` tinyint(1) NOT NULL DEFAULT 1,
  `more_space` tinyint(1) NOT NULL DEFAULT 0,
  `le_fullyinV` tinyint(1) NOT NULL DEFAULT 1,
  `usehalf_Vspace` tinyint(1) NOT NULL DEFAULT 0,
  `skip_week` tinyint(1) NOT NULL DEFAULT 0,
  `sitting_arrangement` tinyint(1) NOT NULL DEFAULT 1,
  `students_per_staff` int(11) NOT NULL DEFAULT 50,
  `staff_specialV` int(11) NOT NULL DEFAULT 5,
  `select_staff_randomly` tinyint(1) NOT NULL DEFAULT 1,
  `update_staff_Dcount` tinyint(1) NOT NULL DEFAULT 1,
  `saveTT_csv` tinyint(1) NOT NULL DEFAULT 1,
  `saveTT_pdf` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `main interface` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `days_per_week` int(11) NOT NULL DEFAULT 5,
  `periods_per_day` int(11) NOT NULL DEFAULT 3,
  `semester` varchar(50) DEFAULT NULL,
  `session` varchar(50) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `examtab` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `schedule_policy` varchar(255) DEFAULT NULL,
  `max_examl` int(11) NOT NULL DEFAULT 0,
  `min_examl` int(11) NOT NULL DEFAULT 0,
  `exam_level_high_limit` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
COMMIT;
