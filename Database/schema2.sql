-- 1. INITIALIZATION
CREATE DATABASE IF NOT EXISTS `examtt2` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `examtt2`;

-- FORCIBLY DISABLE CHECKS
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

-- 2. TOTAL CLEANUP 
DROP TABLE IF EXISTS `registration`;
DROP TABLE IF EXISTS `student_semester_registration`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `role`;
DROP TABLE IF EXISTS `student`;
DROP TABLE IF EXISTS `staff`;
DROP TABLE IF EXISTS `course`;
DROP TABLE IF EXISTS `venue`;
DROP TABLE IF EXISTS `program`;
DROP TABLE IF EXISTS `department`;
DROP TABLE IF EXISTS `general_settings`;
DROP TABLE IF EXISTS `centre`;
DROP TABLE IF EXISTS `constraint_table`;
DROP TABLE IF EXISTS `optimization_settings`;
DROP TABLE IF EXISTS `output_tab`;
DROP TABLE IF EXISTS `examtab`;

-- Centre (College / Campus)
CREATE TABLE centre (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type INT DEFAULT 1,
  state VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Department
CREATE TABLE department (
  id INT AUTO_INCREMENT PRIMARY KEY,
  centre_id INT NOT NULL,
  code VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_dept_centre FOREIGN KEY (centre_id) REFERENCES centre(id) ON DELETE CASCADE
);

-- Program
CREATE TABLE program (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_id INT NOT NULL,
  code VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  duration INT DEFAULT 4,
  total_comp_units INT DEFAULT 0,
  total_req_units INT DEFAULT 0,
  min_elective_units INT DEFAULT 0,
  entry_req TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_prog_dept FOREIGN KEY (department_id) REFERENCES department(id) ON DELETE CASCADE
);


-- Academic Entities

-- Staff
CREATE TABLE staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_id INT,
  staff_id VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100),
  surname VARCHAR(255) NOT NULL,
  firstname VARCHAR(255) NOT NULL,
  middlename VARCHAR(255),
  status_id INT DEFAULT 1,
  type INT DEFAULT 1,
  in_use TINYINT(1) DEFAULT 1,
  duty_count INT DEFAULT 0,
  specialization VARCHAR(255),
  research_area VARCHAR(255),
  discipline VARCHAR(255),
  short_name VARCHAR(50),
  serial_no INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_staff_dept FOREIGN KEY (department_id) REFERENCES department(id)
);

-- Student
CREATE TABLE student (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_id INT,
  program_id INT,
  matric_no VARCHAR(50) UNIQUE NOT NULL,
  surname VARCHAR(255) NOT NULL,
  firstname VARCHAR(255) NOT NULL,
  middlename VARCHAR(255),
  gender VARCHAR(20),
  start_session VARCHAR(20),
  level INT DEFAULT 100,
  programme_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_student_dept FOREIGN KEY (department_id) REFERENCES department(id),
  CONSTRAINT fk_student_prog FOREIGN KEY (program_id) REFERENCES program(id)
);

-- General Settings
CREATE TABLE general_settings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  days_per_week INT NOT NULL DEFAULT 5,
  periods_per_day INT NOT NULL DEFAULT 3,
  semester VARCHAR(50) DEFAULT NULL,
  session VARCHAR(50) DEFAULT NULL,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Course
CREATE TABLE course (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_id INT NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  unit INT DEFAULT 0,
  semester INT DEFAULT 1,
  exam_type INT DEFAULT 2,
  en_count INT DEFAULT 0,
  lecture_hours INT DEFAULT 0,
  tutorial_hours INT DEFAULT 0,
  practical_hours INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_course_dept FOREIGN KEY (department_id) REFERENCES department(id)
);

-- Venue
CREATE TABLE venue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  centre_id INT NOT NULL,
  venue_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  capacity INT NOT NULL,
  type INT DEFAULT 0,
  preference INT DEFAULT 1,
  location VARCHAR(255),
  actual_capacity INT DEFAULT 0,
  in_use TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_venue_centre FOREIGN KEY (centre_id) REFERENCES centre(id)
);

-- 3. Transactional Tables (Highly Volatile)

-- Student Semester Registration (studentsemreg)
-- MUST BE CREATED FIRST because registration table references it
CREATE TABLE student_semester_registration (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  session VARCHAR(20) NOT NULL,
  semester INT NOT NULL,
  level INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_semreg_student FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
  UNIQUE(student_id, session, semester)
);

-- Registration
-- References student_semester_registration via composite FK
CREATE TABLE registration (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  session VARCHAR(20) NOT NULL,
  semester INT NOT NULL,
  course_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reg_student FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
  CONSTRAINT fk_reg_course FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE CASCADE,
  CONSTRAINT fk_reg_enrollment FOREIGN KEY (student_id, session, semester)
    REFERENCES student_semester_registration(student_id, session, semester) ON DELETE CASCADE,
  UNIQUE(student_id, course_id, session)
);

-- 4. Users and Roles (Access Control)

-- Role
CREATE TABLE role (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL,
  code VARCHAR(4) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- hashed using bcrypt
  role_id INT NOT NULL,
  college_id INT,
  department_id INT,
  staff_id INT, -- links to staff.id
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES role(id),
  CONSTRAINT fk_user_college FOREIGN KEY (college_id) REFERENCES centre(id),
  CONSTRAINT fk_user_department FOREIGN KEY (department_id) REFERENCES department(id),
  CONSTRAINT fk_user_staff FOREIGN KEY (staff_id) REFERENCES staff(id)
);


-- 5. Timetable Configuration & Output (Semi-Volatile / Config)

-- Constraint Table
CREATE TABLE constraint_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    periodIncE  VARCHAR(500) DEFAULT NULL, -- e.g., CHM(0,1,2,3);ITP401(1,2)
    periodExcE  VARCHAR(500) DEFAULT NULL, -- e.g., ITP401(0,5,7);MTH101(3,4)
    venueIncE   VARCHAR(500) DEFAULT NULL, -- e.g., CHM101(VENUE);COS202(LAB201)
    venueExcE   VARCHAR(500) DEFAULT NULL, -- e.g., PHY301(HALL);BIO102(LAB102)
    periodIncV  VARCHAR(500) DEFAULT NULL, -- e.g., LAB201(1,2);HALL301(0,3)
    periodExcV  VARCHAR(500) DEFAULT NULL, -- e.g., LAB101(4,5);HALL201(2)
    examWAftE   VARCHAR(500) DEFAULT NULL, -- e.g., MTH101,PHY101;CHM101,COS101
    examWCoinE  VARCHAR(500) DEFAULT NULL, -- e.g., coinciding exams
    examExcE VARCHAR(500) DEFAULT NULL,  -- e.g., PHY101,CHM101;MTH201,COS202
    frontLE VARCHAR(500) DEFAULT NULL    -- e.g., first exams to schedule
);


-- *Depreciated
-- CREATE TABLE constraint_table (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   period_include VARCHAR(500),
--   period_exclude VARCHAR(500),
--   venue_include VARCHAR(500),
--   venue_exclude VARCHAR(500),
--   exam_weight_after VARCHAR(500),
--   exam_weight_coincide VARCHAR(500),
--   exam_exclude VARCHAR(500),
--   front_load_exams VARCHAR(500),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- Algorithm / Optimization Settings

CREATE TABLE optimization_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  display_progress TINYINT(1) DEFAULT 1,
  opt_time VARCHAR(255),
  opt_cycle_count INT DEFAULT 0,
  exam_weight_time TINYINT(1) DEFAULT 1,
  exam_weight_cycle TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Output / Exam Settings

CREATE TABLE output_tab (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mix_exams TINYINT(1) DEFAULT 1,
  more_space TINYINT(1) DEFAULT 0,
  le_fullyinV TINYINT(1) DEFAULT 1,
  saveTT_csv TINYINT(1) DEFAULT 1,
  saveTT_pdf TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE examtab (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  schedule_policy VARCHAR(255),
  max_examl INT DEFAULT 0,
  min_examl INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO `role` ( `name`, `code`) VALUES 
('ADMIN', 'AD'),
('COLLEGE_REP', 'CR'),
('DEPARTMENT_REP', 'DR'),
('STAFF', 'ST');


SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;
COMMIT;
