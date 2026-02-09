-- =============================================
-- COMPLETE Timetable Database Schema
-- Includes: Core tables + Access Control + Settings
-- Optimized for Java backend compatibility
-- =============================================

-- Database initialization
CREATE DATABASE IF NOT EXISTS `examtt3` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `examtt3`;

SET FOREIGN_KEY_CHECKS=0;

-- Drop all tables in dependency order
DROP TABLE IF EXISTS `period_exclusion_snapshots`;
DROP TABLE IF EXISTS `optimization_settings`;
DROP TABLE IF EXISTS `output_tab`;
DROP TABLE IF EXISTS `examtab`;
DROP TABLE IF EXISTS `constraint_table`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `role`;
DROP TABLE IF EXISTS `general_settings`;
DROP TABLE IF EXISTS `registration`;
DROP TABLE IF EXISTS `slashedc`;
DROP TABLE IF EXISTS `venuemod`;
DROP TABLE IF EXISTS `venue`;
DROP TABLE IF EXISTS `student`;
DROP TABLE IF EXISTS `course`;
DROP TABLE IF EXISTS `staffmc_old_mo220124`;
DROP TABLE IF EXISTS `staffmc`;
DROP TABLE IF EXISTS `program_old_we310124`;
DROP TABLE IF EXISTS `program_b4newsys`;
DROP TABLE IF EXISTS `program`;
DROP TABLE IF EXISTS `department`;
DROP TABLE IF EXISTS `centre_old_we310124`;
DROP TABLE IF EXISTS `centre`;
DROP TABLE IF EXISTS `bmas2ccmas`;

SET FOREIGN_KEY_CHECKS=1;

-- =============================================
-- SECTION 1: CORE INSTITUTIONAL TABLES
-- =============================================

-- =============================================
-- Table: centre (Colleges/Faculties)
-- =============================================
CREATE TABLE `centre` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `Code` varchar(10) NOT NULL,
  `name` varchar(120) DEFAULT NULL,
  `type` tinyint UNSIGNED DEFAULT NULL,
  `state` varchar(20) DEFAULT NULL,
  `enCount` int UNSIGNED DEFAULT NULL COMMENT 'Enrollment count (denormalized)',
  `totalVCap` int UNSIGNED DEFAULT NULL COMMENT 'Total venue capacity (denormalized)',
  `zoneCount` tinyint UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_centre_code` (`Code`),
  KEY `idx_centre_state` (`state`),
  KEY `idx_centre_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Colleges/Faculties/Examination Centres';

-- =============================================
-- Table: department
-- =============================================
CREATE TABLE `department` (
  `ID` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `Name` varchar(60) NOT NULL,
  `Code` varchar(5) DEFAULT NULL,
  `HODID` int UNSIGNED DEFAULT NULL COMMENT 'Head of Department - FK to staffmc.serial',
  `CollegeID` int UNSIGNED DEFAULT NULL COMMENT 'FK to centre.id',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `uniq_dept_code` (`Code`),
  KEY `idx_dept_college` (`CollegeID`),
  KEY `idx_dept_hod` (`HODID`),
  CONSTRAINT `fk_department_centre` 
    FOREIGN KEY (`CollegeID`) REFERENCES `centre` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: course
-- =============================================
CREATE TABLE `course` (
  `code` varchar(15) NOT NULL,
  `title` varchar(40) DEFAULT NULL,
  `unit` tinyint UNSIGNED DEFAULT NULL COMMENT 'Credit units (usually 1-6)',
  `semester` tinyint UNSIGNED DEFAULT NULL COMMENT '1=First, 2=Second',
  `enCount` int UNSIGNED DEFAULT NULL COMMENT 'Enrollment count (denormalized)',
  PRIMARY KEY (`code`),
  KEY `idx_course_semester` (`semester`),
  KEY `idx_course_unit` (`unit`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: program (Academic Programs)
-- =============================================
CREATE TABLE `program` (
  `ID` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `Name` varchar(60) NOT NULL,
  `code` varchar(60) DEFAULT NULL,
  `NameCode` varchar(80) DEFAULT NULL COMMENT 'Computed field',
  `Duration` tinyint UNSIGNED DEFAULT NULL COMMENT 'Program duration in years',
  `TCompU` smallint UNSIGNED DEFAULT NULL COMMENT 'Total compulsory units',
  `TReqU` smallint UNSIGNED DEFAULT NULL COMMENT 'Total required units',
  `MinEU` smallint UNSIGNED DEFAULT NULL COMMENT 'Minimum elective units',
  `EntryReq` text DEFAULT NULL COMMENT 'Entry requirements',
  `newCodeID` tinyint UNSIGNED DEFAULT NULL,
  `DeptID` int UNSIGNED DEFAULT NULL COMMENT 'FK to department.ID',
  `CollegeID` int UNSIGNED DEFAULT NULL COMMENT 'FK to centre.id',
  `CoordID` int UNSIGNED DEFAULT NULL COMMENT 'Coordinator - FK to staffmc.serial',
  PRIMARY KEY (`ID`),
  KEY `idx_program_dept` (`DeptID`),
  KEY `idx_program_college` (`CollegeID`),
  KEY `idx_program_coord` (`CoordID`),
  KEY `idx_program_code` (`code`),
  CONSTRAINT `fk_program_department` 
    FOREIGN KEY (`DeptID`) REFERENCES `department` (`ID`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_program_centre` 
    FOREIGN KEY (`CollegeID`) REFERENCES `centre` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: staffmc (Staff Members)
-- =============================================
CREATE TABLE `staffmc` (
  `serial` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `StaffID` varchar(10) DEFAULT NULL,
  `Title` varchar(10) NOT NULL DEFAULT '' COMMENT 'Dr., Prof., Mr., etc.',
  `FirstName` varchar(20) DEFAULT NULL,
  `MiddleName` varchar(20) DEFAULT NULL,
  `Surname` varchar(20) DEFAULT NULL,
  `ShortName` varchar(30) NOT NULL,
  `StatusID` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Employment status',
  `InUse` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1=active, 0=inactive',
  `CollegeID` int UNSIGNED NOT NULL COMMENT 'FK to centre.id',
  `DutyCount` smallint UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Assigned duties count',
  PRIMARY KEY (`serial`),
  UNIQUE KEY `uniq_staff_id` (`StaffID`),
  KEY `idx_staff_college` (`CollegeID`),
  KEY `idx_staff_inuse` (`InUse`),
  KEY `idx_staff_status` (`StatusID`),
  KEY `idx_staff_shortname` (`ShortName`),
  CONSTRAINT `fk_staffmc_centre` 
    FOREIGN KEY (`CollegeID`) REFERENCES `centre` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add FK for HOD and Coordinator after staffmc exists
ALTER TABLE `department`
  ADD CONSTRAINT `fk_department_hod` 
    FOREIGN KEY (`HODID`) REFERENCES `staffmc` (`serial`)
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `program`
  ADD CONSTRAINT `fk_program_coordinator` 
    FOREIGN KEY (`CoordID`) REFERENCES `staffmc` (`serial`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================
-- Table: student
-- =============================================
CREATE TABLE `student` (
  `cenID` int UNSIGNED NOT NULL COMMENT 'FK to centre.id',
  `matricNo` varchar(22) NOT NULL COMMENT 'Matriculation number',
  `fulLname` varchar(50) DEFAULT NULL COMMENT 'Full name',
  `Programme` varchar(70) NOT NULL COMMENT 'Program name',
  `deptID` int UNSIGNED DEFAULT NULL COMMENT 'FK to department.ID',
  `DeptCode` varchar(5) NOT NULL COMMENT 'Redundant with deptID',
  `level` smallint UNSIGNED DEFAULT NULL COMMENT 'Level: 100, 200, 300, etc.',
  PRIMARY KEY (`matricNo`),
  KEY `idx_student_centre` (`cenID`),
  KEY `idx_student_dept` (`deptID`),
  KEY `idx_student_level` (`level`),
  KEY `idx_student_programme` (`Programme`),
  CONSTRAINT `fk_student_centre` 
    FOREIGN KEY (`cenID`) REFERENCES `centre` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_student_department` 
    FOREIGN KEY (`deptID`) REFERENCES `department` (`ID`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: venue
-- =============================================
CREATE TABLE `venue` (
  `ID` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `Name` varchar(40) DEFAULT NULL,
  `vCode` varchar(13) NOT NULL COMMENT 'Venue code',
  `Capacity` smallint UNSIGNED DEFAULT NULL COMMENT 'Designed capacity',
  `actualcap` smallint UNSIGNED DEFAULT NULL COMMENT 'Actual capacity',
  `Type` tinyint UNSIGNED DEFAULT NULL COMMENT 'Venue type',
  `cenID` int UNSIGNED DEFAULT NULL COMMENT 'FK to centre.id',
  `InUse` tinyint UNSIGNED NOT NULL DEFAULT 1 COMMENT '1=active, 0=inactive',
  `Preference` smallint UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Allocation preference',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `uniq_venue_code` (`vCode`),
  KEY `idx_venue_centre` (`cenID`),
  KEY `idx_venue_type` (`Type`),
  KEY `idx_venue_inuse` (`InUse`),
  KEY `idx_venue_capacity` (`Capacity`),
  KEY `idx_venue_centre_type_inuse` (`cenID`, `Type`, `InUse`),
  CONSTRAINT `fk_venue_centre` 
    FOREIGN KEY (`cenID`) REFERENCES `centre` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: registration (Student Course Registration)
-- =============================================
CREATE TABLE `registration` (
  `regIDMC` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `centreID` int UNSIGNED NOT NULL COMMENT 'FK to centre.id',
  `ID` int UNSIGNED NOT NULL COMMENT 'Registration sequence',
  `session` varchar(9) DEFAULT NULL COMMENT 'Academic session',
  `semester` tinyint UNSIGNED DEFAULT NULL COMMENT '1=First, 2=Second',
  `matricNo` varchar(20) DEFAULT NULL COMMENT 'FK to student.matricNo',
  `courseCode` varchar(15) DEFAULT NULL COMMENT 'FK to course.code',
  `level` smallint UNSIGNED DEFAULT NULL COMMENT 'Student level',
  PRIMARY KEY (`regIDMC`),
  KEY `idx_reg_centre` (`centreID`),
  KEY `idx_reg_student` (`matricNo`),
  KEY `idx_reg_course` (`courseCode`),
  KEY `idx_reg_session` (`session`),
  KEY `idx_reg_semester` (`semester`),
  KEY `idx_reg_level` (`level`),
  KEY `idx_reg_student_session` (`matricNo`, `session`, `semester`),
  KEY `idx_reg_course_semester` (`courseCode`, `semester`, `session`),
  CONSTRAINT `fk_registration_centre` 
    FOREIGN KEY (`centreID`) REFERENCES `centre` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_registration_student` 
    FOREIGN KEY (`matricNo`) REFERENCES `student` (`matricNo`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_registration_course` 
    FOREIGN KEY (`courseCode`) REFERENCES `course` (`code`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- SECTION 2: ACCESS CONTROL & USER MANAGEMENT
-- =============================================

-- =============================================
-- Table: role (User Roles)
-- =============================================
CREATE TABLE `role` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `code` varchar(4) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_role_code` (`code`),
  UNIQUE KEY `uniq_role_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Access control roles';

-- =============================================
-- Table: users (System Users)
-- =============================================
CREATE TABLE `users` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL COMMENT 'Hashed password',
  `role_id` int UNSIGNED NOT NULL COMMENT 'FK to role.id',
  `college_id` int UNSIGNED DEFAULT NULL COMMENT 'FK to centre.id',
  `department_id` int UNSIGNED DEFAULT NULL COMMENT 'FK to department.ID',
  `staff_id` int UNSIGNED DEFAULT NULL COMMENT 'FK to staffmc.serial',
  `email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_user_username` (`username`),
  UNIQUE KEY `uniq_user_email` (`email`),
  KEY `idx_user_role` (`role_id`),
  KEY `idx_user_college` (`college_id`),
  KEY `idx_user_department` (`department_id`),
  KEY `idx_user_staff` (`staff_id`),
  CONSTRAINT `fk_user_role` 
    FOREIGN KEY (`role_id`) REFERENCES `role` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_user_college` 
    FOREIGN KEY (`college_id`) REFERENCES `centre` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_user_department` 
    FOREIGN KEY (`department_id`) REFERENCES `department` (`ID`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_user_staff` 
    FOREIGN KEY (`staff_id`) REFERENCES `staffmc` (`serial`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='System users with role-based access';

-- =============================================
-- SECTION 3: EXAM CONFIGURATION & SETTINGS
-- =============================================

-- =============================================
-- Table: general_settings (Institutional Framework)
-- =============================================
CREATE TABLE `general_settings` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `description` text DEFAULT NULL,
  `days_per_week` tinyint UNSIGNED NOT NULL DEFAULT 7,
  `periods_per_day` tinyint UNSIGNED NOT NULL DEFAULT 2,
  `semester` tinyint UNSIGNED DEFAULT 1 COMMENT '1=First, 2=Second',
  `session` varchar(50) DEFAULT NULL COMMENT 'Academic session: 2024/2025',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `exam_category` tinyint UNSIGNED DEFAULT 0 COMMENT '0=Regular, 1=TopUp, 2=PartTime, 3=Online',
  `campus_type` tinyint UNSIGNED DEFAULT 0 COMMENT '0=Single, 1=Multi',
  `exam_level` varchar(100) DEFAULT 'All' COMMENT 'All or specific levels',
  `exam_weeks` tinyint UNSIGNED DEFAULT 2,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_settings_session` (`session`),
  KEY `idx_settings_semester` (`semester`),
  KEY `idx_settings_dates` (`start_date`, `end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Exam timetabling configuration';

-- =============================================
-- Table: period_exclusion_snapshots (Temporal Masking)
-- =============================================
CREATE TABLE `period_exclusion_snapshots` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `general_settings_id` bigint UNSIGNED NOT NULL COMMENT 'FK to general_settings.id',
  `name` varchar(255) NOT NULL DEFAULT 'Untitled Snapshot',
  `excluded_periods` varchar(500) NOT NULL DEFAULT '' COMMENT 'Comma-separated period IDs',
  `is_active` tinyint UNSIGNED NOT NULL DEFAULT 0 COMMENT '1=active, 0=inactive',
  `created_by` varchar(100) NOT NULL DEFAULT 'system',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_exclusion_settings` (`general_settings_id`),
  KEY `idx_exclusion_active` (`general_settings_id`, `is_active`),
  KEY `idx_exclusion_created` (`created_at` DESC),
  CONSTRAINT `fk_period_exclusion_settings` 
    FOREIGN KEY (`general_settings_id`) REFERENCES `general_settings` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Period exclusion snapshots for timetabling';

-- =============================================
-- SECTION 4: SOLVER SETTINGS & CONSTRAINTS
-- =============================================

-- =============================================
-- Table: constraint_table (Snapshot-based Constraints)
-- =============================================
CREATE TABLE `constraint_table` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT 'Untitled Snapshot',
  `record_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `period_inc_e` varchar(500) DEFAULT NULL COMMENT 'Period include for exams',
  `period_exc_e` varchar(500) DEFAULT NULL COMMENT 'Period exclude for exams',
  `venue_inc_e` varchar(500) DEFAULT NULL COMMENT 'Venue include for exams',
  `venue_exc_e` varchar(500) DEFAULT NULL COMMENT 'Venue exclude for exams',
  `period_inc_v` varchar(500) DEFAULT NULL COMMENT 'Period include for venues',
  `period_exc_v` varchar(500) DEFAULT NULL COMMENT 'Period exclude for venues',
  `exam_w_aft_e` varchar(500) DEFAULT NULL COMMENT 'Exam with/after exam',
  `exam_w_coin_e` varchar(500) DEFAULT NULL COMMENT 'Exam with coinciding exam',
  `exam_exc_e` varchar(500) DEFAULT NULL COMMENT 'Exam exclude exam',
  `front_l_e` varchar(500) DEFAULT NULL COMMENT 'Front load exams',
  `staff_omit` text DEFAULT NULL COMMENT 'Staff omissions',
  `staff_period_excl` text DEFAULT NULL COMMENT 'Staff period exclusions',
  PRIMARY KEY (`id`),
  KEY `idx_constraint_date` (`record_date` DESC),
  KEY `idx_constraint_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Timetabling constraints and rules';

-- =============================================
-- Table: optimization_settings
-- =============================================
CREATE TABLE `optimization_settings` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `display_progress` tinyint UNSIGNED DEFAULT 1 COMMENT '1=show, 0=hide',
  `opt_time` varchar(255) DEFAULT NULL COMMENT 'Optimization time limit',
  `opt_cycle_count` int UNSIGNED DEFAULT 0 COMMENT 'Optimization cycles',
  `exam_weight_time` tinyint UNSIGNED DEFAULT 1 COMMENT 'Time-based weighting',
  `exam_weight_cycle` tinyint UNSIGNED DEFAULT 1 COMMENT 'Cycle-based weighting',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Solver optimization parameters';

-- =============================================
-- Table: output_tab (Display Settings)
-- =============================================
CREATE TABLE `output_tab` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `invigilator_ratio` int UNSIGNED DEFAULT 30 COMMENT 'Student to invigilator ratio',
  `invigilator_special_ratio` int UNSIGNED DEFAULT 15 COMMENT 'Special venue invigilator ratio',
  `venue_alg` tinyint UNSIGNED DEFAULT 1 COMMENT 'Venue Selection Policy: 1=Default',
  `venue_alg_order` tinyint UNSIGNED DEFAULT 1 COMMENT 'Venue Selection Order: 1=Default',
  `mix_exams` tinyint UNSIGNED DEFAULT 1 COMMENT 'Mix exams in venue',
  `more_space` tinyint UNSIGNED DEFAULT 0 COMMENT 'More space for large exams',
  `le_fullyinV` tinyint UNSIGNED DEFAULT 1 COMMENT 'Large exams fully in venue',
  `use_half_venue` tinyint UNSIGNED DEFAULT 0 COMMENT 'Use half venue space',
  `select_staff_random` tinyint UNSIGNED DEFAULT 1 COMMENT 'Select staff randomly',
  `use_staff_ids` tinyint UNSIGNED DEFAULT 0 COMMENT 'Use Staff IDs in Timetable',
  `update_staff_duty` tinyint UNSIGNED DEFAULT 1 COMMENT 'Update StaffDuty Count',
  `skip_week` tinyint UNSIGNED DEFAULT 0 COMMENT 'Skip Week in Timetable',
  `gen_sitting_arr` tinyint UNSIGNED DEFAULT 0 COMMENT 'Generate Sitting Arrangements',
  `save_file` tinyint UNSIGNED DEFAULT 1 COMMENT 'Save Timetable to File (CSV/PDF)',
  `save_to_db` tinyint UNSIGNED DEFAULT 1 COMMENT 'Save Timetable to Database',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Timetable output and display preferences';

-- =============================================
-- Table: examtab (Scheduling Policy)
-- =============================================
CREATE TABLE `examtab` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `schedule_policy` tinyint UNSIGNED DEFAULT 1 COMMENT '1=LargestEnroll, 2=LargestConflict, 3=Combined',
  `max_examl` int UNSIGNED DEFAULT 0 COMMENT 'Maximum exam load',
  `min_examl` int UNSIGNED DEFAULT 0 COMMENT 'Minimum exam load',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Exam scheduling policies and boundaries';

-- =============================================
-- SECTION 5: UTILITY TABLES
-- =============================================

-- =============================================
-- Table: slashedc (Combined/Slashed Courses)
-- WARNING: Violates 1NF
-- =============================================
CREATE TABLE `slashedc` (
  `ID` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `codes` varchar(80) NOT NULL COMMENT 'Multiple course codes - VIOLATES 1NF',
  `Type` tinyint UNSIGNED NOT NULL,
  `Sem` tinyint UNSIGNED DEFAULT NULL COMMENT 'Semester',
  PRIMARY KEY (`ID`),
  KEY `idx_slashed_sem` (`Sem`),
  KEY `idx_slashed_type` (`Type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='WARNING: Violates normalization';

-- =============================================
-- Table: bmas2ccmas (Code Mapping)
-- =============================================
CREATE TABLE `bmas2ccmas` (
  `ID` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `CODE` varchar(12) NOT NULL,
  `ACODE` varchar(7) NOT NULL,
  `REP` varchar(6) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `idx_bmas_code` (`CODE`),
  KEY `idx_bmas_acode` (`ACODE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Table: venuemod (Modified Venue Info)
-- =============================================
CREATE TABLE `venuemod` (
  `ID` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `Name` varchar(40) DEFAULT NULL,
  `vCode` varchar(13) NOT NULL,
  `Capacity` smallint UNSIGNED DEFAULT NULL,
  `actualcap` smallint UNSIGNED DEFAULT NULL,
  `Type` tinyint UNSIGNED DEFAULT NULL,
  `cenID` int UNSIGNED DEFAULT NULL,
  `InUse` tinyint UNSIGNED NOT NULL DEFAULT 1,
  `Preference` smallint UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`),
  KEY `idx_venuemod_centre` (`cenID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Consider merging with venue table';

-- =============================================
-- SECTION 6: HISTORICAL/ARCHIVED TABLES
-- =============================================

CREATE TABLE `centre_old_we310124` (
  `id` int UNSIGNED NOT NULL,
  `Code` varchar(10) NOT NULL,
  `name` varchar(120) DEFAULT NULL,
  `type` tinyint UNSIGNED DEFAULT NULL,
  `state` varchar(20) DEFAULT NULL,
  `enCount` int UNSIGNED DEFAULT NULL,
  `totalVCap` int UNSIGNED DEFAULT NULL,
  `zoneCount` tinyint UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='ARCHIVE: Centre data before Jan 31, 2024';

CREATE TABLE `program_b4newsys` (
  `ID` int UNSIGNED NOT NULL,
  `Name` varchar(60) NOT NULL,
  `code` varchar(6) NOT NULL,
  `Duration` tinyint UNSIGNED DEFAULT NULL,
  `TCompU` smallint UNSIGNED DEFAULT NULL,
  `TReqU` smallint UNSIGNED DEFAULT NULL,
  `MinEU` smallint UNSIGNED DEFAULT NULL,
  `EntryReq` text NOT NULL,
  `newCodeID` tinyint UNSIGNED NOT NULL,
  `DeptID` int UNSIGNED DEFAULT NULL,
  `CollegeID` int UNSIGNED NOT NULL,
  `CoordID` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='ARCHIVE: Program data before new system';

CREATE TABLE `program_old_we310124` (
  `ID` int UNSIGNED NOT NULL,
  `Name` varchar(60) NOT NULL,
  `code` varchar(6) NOT NULL,
  `Duration` tinyint UNSIGNED DEFAULT NULL,
  `TCompU` smallint UNSIGNED DEFAULT NULL,
  `TReqU` smallint UNSIGNED DEFAULT NULL,
  `MinEU` smallint UNSIGNED DEFAULT NULL,
  `EntryReq` text NOT NULL,
  `newCodeID` tinyint UNSIGNED NOT NULL,
  `DeptID` int UNSIGNED DEFAULT NULL,
  `CollegeID` int UNSIGNED NOT NULL,
  `CoordID` int UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='ARCHIVE: Program data before Jan 31, 2024';

CREATE TABLE `staffmc_old_mo220124` (
  `serial` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `StaffID` varchar(10) DEFAULT NULL,
  `Title` varchar(10) NOT NULL DEFAULT '',
  `FullName` varchar(40) NOT NULL,
  `ShortName` varchar(30) NOT NULL,
  `StatusID` tinyint UNSIGNED NOT NULL,
  `InUse` tinyint UNSIGNED NOT NULL,
  `CollegeID` int UNSIGNED NOT NULL,
  `DutyCount` smallint UNSIGNED NOT NULL,
  PRIMARY KEY (`serial`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='ARCHIVE: Staff data before Jan 22, 2024';

-- =============================================
-- SECTION 7: INITIAL DATA
-- =============================================

-- Insert default roles
INSERT INTO `role` (`name`, `code`) VALUES 
('ADMIN', 'AD'),
('COLLEGE_REP', 'CR'),
('DEPARTMENT_REP', 'DR'),
('STAFF', 'ST');

-- =============================================
-- SUMMARY OF COMPLETE SCHEMA
-- =============================================
/*
SECTIONS:
1. Core Institutional Tables (centre, department, course, program, staffmc, student, venue, registration)
2. Access Control & User Management (role, users)
3. Exam Configuration & Settings (general_settings, period_exclusion_snapshots)
4. Solver Settings & Constraints (constraint_table, optimization_settings, output_tab, examtab)
5. Utility Tables (slashedc, bmas2ccmas, venuemod)
6. Historical/Archived Tables (old versions)

KEY IMPROVEMENTS:
✅ All IDs are UNSIGNED (prevents negative values)
✅ Consistent data types across related tables
✅ All foreign keys properly defined
✅ Comprehensive indexes for performance
✅ utf8mb4_unicode_ci for international characters
✅ Proper CASCADE/RESTRICT behaviors
✅ Comments explain field purposes

JAVA COMPATIBILITY:
✅ No Java code changes required
✅ All types compatible with Java Integer/String
✅ Foreign keys enforce integrity at DB level
✅ Indexes transparent to application

NEW FEATURES:
✅ Role-based access control (users, role tables)
✅ Exam timetabling configuration (general_settings)
✅ Constraint management (constraint_table)
✅ Optimization settings for solver
✅ Output formatting preferences

FK CORRECTIONS MADE:
- users.staff_id now correctly references staffmc.serial (was staff.id)
- All college_id fields reference centre.id
- All department_id fields reference department.ID
- Consistent UNSIGNED types across FK relationships
*/
