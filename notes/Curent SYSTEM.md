# Bells University Timetable Generator – Refactor Guidance Document (Main System)

## 1. Conceptual Overview

**System Purpose:**

- Centralized academic management system for Bells University
- Core operations:
  - Student, staff, course, program, department, college, venue management
  - Timetable generation (exams and courses)
  - Course registration and enrollment tracking
  - Role-based access control for administration

**Key Principles for Refactor:**

1. **Enrollment-First Principle**: A student must have an active record in `student_semester_registration` (Enrollment) before they can register for any courses in the `registration` table. This defines academic "existence" vs "commitment".
2. **Single Source of Truth**: All entities must reference central tables (students, courses, staff, departments) to prevent redundancy.
3. **Data Stability vs Volatility**: Identify tables that rarely change (reference data) vs highly volatile tables (registrations, enrollments, exam constraints).
4. **Separation of Concerns**: Clearly separate layers – database, service (business logic), API controllers, frontend.
5. **Deterministic Timetable Scope**: Timetable generation must resolve the set of active students from `student_semester_registration` first, then derive exams from `registration`. These tables must never be merged.
6. **Extendability Without Schema Rewrite**: Use flexible fields for configuration, flags, or optional JSON for complex rules in `constraint_table`, `optimization_settings`, `output_tab`.
7. **Zero-Trust DB Interaction Verification**: Every database interaction MUST be verified at the service layer. No raw or unvalidated data is allowed to reach the persistence layer. Verification includes type safety, foreign key existence, and business rule compliance.

---

## 2. High-Level System Architecture

**Current Architecture Type:** Monolithic backend with REST API + SPA frontend

**Layers:**

1. **Frontend Layer (React + TypeScript):**
   - User interfaces for Admin, Department, Staff, (future scoope: Student (view-only))
   - Data fetching via React Query (server-state management)
   - Local state via Zustand
   - SPA routing (React Router)

2. **Backend Layer (Spring Boot + Java + JPA):**
   - Controllers: Handle REST requests (`UserController`, `CourseController`, `RegistrationController`, etc.)
   - Services: Encapsulate business logic (`UserService`, `CourseService`, `AlgorithmService`)
   - Repositories: JPA-based data access (`StudentRepository`, `CourseRepository`)

3. **Database Layer (MySQL 8.x):**
   - Centralized relational database `examtt` (tell me the db endpoint so where i can change to test a seprate version of db later on)
   - Core reference tables: `centre`, `department`, `program`, `course`, `staff`, `student`, `venue`
   - Transactional tables: `registration`, `studentsemreg`, `slashedcourse`
   - Configuration tables: `constraint_table`, `optimization_settings`, `output_tab`, `main_interface`, `examtab`

---

## 3. Logical Model & Business Logic

**Entity Relationships:**

- `centre` → `department` → `program` → `student`
- `course` linked to `department` and `centre`
- `staff` linked to `department`
- `users` link to `staff` or admin role
- `registration` links students to courses

**Key Business Logic Flows:**

1. **Course Registration**
   - Input: Student ID, Course Code, Session, Semester
   - Validation Step 1 (Existence): Verify record in `student_semester_registration` for the student/session/semester.
   - Validation Step 2 (Commitment): Check conflicts with existing schedule, enrollment limits, prerequisites.
   - Output: Registration record in `registration` table.

2. **Timetable Generation**
   - Input: Courses, Staff, Venues, Constraints
   - Algorithm: Constraint satisfactio + optimization
   - Output: Exam and course timetables written to `output_tab` and generated schedules

3. **Role-Based Access Control**
   - ADMIN: Full system visibility
   - COLLEGE_REP / DEPARTMENT_REP: Scoped to assigned college/department
   - STAFF/LECTURER: Scoped to assigned courses and teaching responsibilities
   - STUDENT: Scoped to personal enrollment and timetable

4. **Configuration Management**
   - `constraint_table`: Exam/venue constraints, period inclusion/exclusion
   - `optimization_settings`: Algorithm behavior flags
   - `output_tab`: Timetable generation preferences

---

## 4. Backend Architectural Guidelines

**Refactor Considerations:**

1. **Service Layer Discipline**
   - Each domain entity has its own service
   - Services only handle business rules, not persistence logic directly

2. **Repository Layer Discipline**
   - JPA Repositories for each entity
   - Standardize query patterns (avoid raw SQL unless necessary)

3. **Controller Layer Discipline**
   - Stateless, validation-heavy endpoints
   - Keep controllers thin, delegate logic to services

4. **Transactional Boundaries**
   - Enforce atomic operations at service level
   - Registration creation + timetable update must be transactional

5. **Error Handling**
   - Unified API error format
   - Validation errors, DB constraint violations, and algorithm failures handled gracefully

6. **Database Interaction Verification (DIV) Enforcement**
   - **Pre-Verification**: Every mutation (INSERT/UPDATE/DELETE) must verify:
     - Existence of all foreign key entities.
     - Role-based scope (Actor has permission for the specific entity).
     - Business invariants (e.g., student must be enrolled before course registration).
   - **Sanitization**: All inputs must be sanitized and validated for type/length/format.
   - **Atomicity**: Multi-table updates must use `@Transactional` to ensure a consistent state.
   - **No Orphan States**: Verification must prevent the creation of orphaned records.

---

## 5. Conceptual & Logic Model


**Input:**

- Entities, relationships, and volatility (from database)
- Current business logic flows (registration, timetable generation, role access)
- Current tech stack & deployment

**Expected Output from AI:**

- Suggested normalization / refactor of volatile tables
- Encapsulation of algorithmic logic for modularity
- Enforcement of RBAC in service layer
- Recommendations for decoupling configuration from code
- Todo list for stepwise implementation

**Example Logic Flow Diagram (AI Input Format):**

```
Student → Registers for Course → Validation Service → Checks Conflicts / Capacity → Creates Registration → Updates Timetable
Staff → Assigned to Course → Algorithm assigns invigilation/teaching slots → Updates schedule
Admin → Updates Config → Services propagate changes → Affect future timetable generations
```

---

## 6. Refactor To-Do Outline

1. **Database**
   - Review primary keys and foreign keys for consistency
   - Identify tables needing normalization or de-normalization
   - Flag semi-volatile tables for caching or optimization

2. **Backend**
   - Refactor service layer to separate domain logic from persistence.
   - **Enforce Enrollment-First Dependency**: Implement mandatory check for `student_semester_registration` in `RegistrationService`.
   - **DIV Implementation**: Add mandatory verification checks for all database mutation methods in services.
   - Encapsulate algorithm and constraint logic into separate modules.
   - Add centralized error handling.

3. **Controllers**
   - Validate inputs strictly
   - Enforce RBAC programmatically
   - Standardize JSON responses

4. **Configuration Management**
   - Externalize algorithm/config flags to dedicated tables or JSON configs
   - Define read/write boundaries to prevent runtime errors

5. **Testing**
   - Unit tests for services
   - Integration tests for controllers + DB
   - Algorithm correctness validation with sample data

6. **Deployment Considerations**
   - Prepare for horizontal scalability in the future
   - Centralize environment variables and secrets

---


## 1. Conceptual & Mental Model

### 1.1 Core Concept

The system centralizes university academic data (students, staff, courses, programs, departments, venues) and generates timetables for courses and exams based on configurable constraints.

**Key Principles:**

1. **Single Source of Truth:** All institutional data resides in the `examtt` MySQL database.
2. **Role-based Access Control:** All users interact through API endpoints; access rights are enforced by backend services.
3. **Layered Architecture:** Separation between frontend, backend services, and database, with clear transactional boundaries.
4. **Volatility Categorization:**
   - **Stable data:** `centre`, `department`, `program`, `staff` (rarely modified)
   - **Semi-volatile:** `student`, `course`, `constraint_table`, `main_interface`
   - **Highly volatile:** `registration` (real-time student course registration)

5. **Configuration-driven Timetable Generation:** Algorithm relies on `constraint_table`, `optimization settings`, and `output tab`.

---

### 1.2 Access-Resolution Flow (User → Data)

```
User Action (Frontend UI)
     │
     ▼
Authentication Layer (JWT/Session)
     │
     ▼
Authorization & Role Resolution
     │
     ▼
Controller Endpoint (Spring Boot REST API)
     │
     ▼
Service Layer (Business Logic & Rules)
     │
     ▼
Repository Layer (JPA/Hibernate)
     │
     ▼
Database (MySQL examtt)
```

**Key Notes:**

- All data reads/writes go through the Service Layer; direct DB access by UI is prohibited.
- Roles (admin, college rep, department rep, staff) determine data scope.
- Future-proof: adding new roles or dashboards requires updating the service and repository layers, not DB schema.

---

### 1.3 “What Changes / What Never Changes” Doctrine

| Category             | Examples                                    | Change Frequency |
| -------------------- | ------------------------------------------- | ---------------- |
| **Reference Data**   | `centre`, `department`, `program`, `role`   | Rare             |
| **Operational Data** | `student`, `course`, `staff`, `venue`       | Medium           |
| **Transaction Data** | `registration`, `timetable generation`      | High             |
| **Configuration**    | `constraint_table`, `optimization settings` | Low              |

**Guideline:** Schema for reference data should remain stable; operational and transactional tables should support flexible updates without schema changes, using columns, versioning, or configuration tables.

---

## 2. Business Logic

### 2.1 Service Responsibilities

- **UserService:** Authentication, role validation, department/college scoping
- **StudentService:** Student enrollment, level validation, program linking, and managing `student_semester_registration` entries.
- **RegistrationService:** Handles course-level registration; **Mandatory Step**: Must verify student enrollment in `student_semester_registration` before inserting into `registration`. Prevent conflicts and write to `registration`.
- **CourseService:** Course creation, semester/credit management, enrollment caps.
- **AlgorithmService:** Generates timetable based on constraints and optimization settings
- **ConstraintService:** Validates exam periods, venue allocations, conflicts
- **OutputService:** Converts generated timetables into CSV/PDF

### 2.2 Key Rules

1. Students cannot register for courses exceeding credit limits or overlapping periods.
2. Exam scheduling respects venue availability and configured exclusions/inclusions.
3. Staff assignment for invigilation is auto-tracked and output per `output tab` rules.
4. All updates are logged with timestamps for auditability.

---

## 3. Current System Architecture (Text Diagram)

```
┌─────────────────────────────────────────────┐
│               FRONTEND (React + TS)        │
│ • Login / Dashboard / Management UIs       │
│ • Timetable UI / Registration UI           │
│ • Student / Staff / Course Views           │
└───────────────┬─────────────────────────────┘
                │ HTTP REST API (JSON)
                ▼
┌─────────────────────────────────────────────┐
│         BACKEND (Java + Spring Boot)        │
│ CONTROLLERS                                 │
│ • User, Student, Staff, Course, Registration│
│ SERVICES                                    │
│ • Userservice, Studentservice, Courseservice│
│ • Registrationservice, Algorithmservice    │
│ REPOSITORIES                                │
│ • JPA Repositories for all core entities   │
└───────────────┬─────────────────────────────┘
                │ JDBC / JPA
                ▼
┌─────────────────────────────────────────────┐
│             DATABASE (MySQL 8.x)           │
│ • Tables: centre, department, program      │
│           student, staff, course           │
│           registration, users, role        │
│           constraint_table, optimization   │
│           output tab, main_interface       │
└─────────────────────────────────────────────┘
```

---

## 4. Backend Refactor Recommendations

1. **Refactor Controllers:**
   - Consolidate repetitive CRUD patterns with generic base controllers.
   - Introduce DTOs for API responses to decouple DB from UI.

2. **Service Layer Optimization:**
   - Isolate business logic from controllers completely.
   - Implement modular services for timetable generation to allow future algorithm swapping.

3. **Repository Layer Improvements:**
   - Use parameterized queries to enforce security.
   - Introduce repository-level caching (Redis or in-memory) for semi-volatile data like course lists.

4. **Security Enhancements:**
   - Hash passwords with BCrypt (currently plain text).
   - Enforce JWT token validation and refresh policies.
   - Implement audit logging for critical tables.

5. **UI/UX Recommendations:**
   - Refactor dashboard components to use shared reusable components.
   - Integrate global state via Zustand for consistent data representation.
   - Implement error and loading states for all API calls.
   - Optimize timetable grid rendering for performance.

---

## 5. Refactor-To-Do List (Actionable)

**Step 1: Backend**

- [ ] Hash user passwords and implement secure login.
- [ ] Consolidate controllers with base CRUD structure.
- [ ] Refactor services for modular timetable logic.
- [ ] Introduce repository caching for high-read tables.
- [ ] Add audit logging for student/course/registration changes.

**Step 2: Database**

- [ ] Normalize semi-volatile fields if needed (e.g., course enrollment counts separate).
- [ ] Review foreign keys and cascading rules.
- [ ] Add indexes for frequently queried fields (matric_no, course_code).

**Step 3: Frontend**

- [ ] Refactor dashboard components for consistency.
- [ ] Integrate Zustand state globally.
- [ ] Optimize timetable rendering for large data.
- [ ] Add validation and error handling.

**Step 4: Testing**

- [ ] Unit tests for all service logic.
- [ ] Integration tests for critical endpoints.
- [ ] Load test timetable generation under realistic data volumes.

---

This document is ready to hand off to an AI agent for **refactor planning and task generation**, as it captures:

- Full backend and DB architecture
- Conceptual and logical flow
- Business rules and constraints
- UI/UX refactor needs
- Actionable step-by-step tasks

---

# **Bells University Timetable Generator – Refactor To-Do Plan (Current System)**

## **1. Backend Refactor Tasks**

**Goal:** Clean up controllers, services, and repositories to align with current DB and maintain clear separation of concerns.

**To-Do:**

1. **Controller Layer**
   - Audit all endpoints; ensure naming consistency.
   - Consolidate redundant endpoints (e.g., student/course queries).
   - Introduce **API versioning** for stability.
   - Ensure all endpoints only interact via services (no direct DB calls in controllers).

2. **Service Layer**
   - Encapsulate all business logic; remove any inline logic in controllers.
   - Standardize **error handling** and response formats.
   - Validate input parameters against DB constraints.
   - Ensure transactional integrity for multi-step operations (e.g., student registration → update `en_count` in course).

3. **Repository Layer**
   - Replace inline queries with JPA repository methods where possible.
   - Add indexes for high-volatility tables (`registration`, `course`) to improve performance.
   - Introduce **soft-delete logic** for `staff`, `venue`, `course` (in case of deactivation rather than deletion).

4. **API-DB Separation**
   - Create a clear interface between the main timetable generation logic and the database.
   - Introduce a **generation API layer** that triggers logic without exposing DB operations externally.

---

## **2. Database Refactor Tasks**

**Goal:** Stabilize core schema while maintaining flexibility for algorithm integration.

**To-Do:**

1. **Core Tables**
   - Verify primary/foreign key integrity (`centre → department → program → student`).
   - Add **ON UPDATE CASCADE** where logical for reference tables (`programme`, `course`).
   - Confirm semi-volatile tables (`registration`, `constraint_table`) have proper indexing and constraints.

2. **Audit & Logging**
   - Introduce **audit tables** for changes to `registration`, `course`, `student`.
   - Track modification timestamps for sensitive operations.

3. **Data Access Optimization**
   - Review joins in timetable generation queries; optimize via **indexed views** or **materialized tables** if necessary.
   - Evaluate high-load tables (`registration`) for partitioning by session/semester.

4. **Configuration Tables**
   - Consolidate `optimization settings`, `output tab`, `main interface`, `examtab` into a **single configuration schema** with well-defined relationships to minimize scattering.

5. **Volatility Classification**
   - **Stable:** `centre`, `department`, `program`, `role`, `staff`
   - **Semi-volatile:** `course`, `student`, `constraint_table`
   - **Highly volatile:** `registration`, `slashedcourse`, `studentsemreg`

---

## **3. Business Logic Refactor Tasks**

**Goal:** Ensure the **core logic** is separated from frontend and tightly integrated with DB.

**To-Do:**

1. **Encapsulate Timetable Generation**
   - Wrap generation logic in a **service/API layer**.
   - Ensure it only interacts with the DB via repositories.
   - Validate input data (students, courses, venues) before triggering generation.

2. **Access & Security**
   - Enforce **role-based logic** in services.
   - Implement **pre-checks** for admin/college/department scope before allowing operations.
   - Review sensitive operations (`update_staff_Dcount`, `saveTT_csv/pdf`) to prevent accidental misuse.

3. **Constraints Section Handling Directive**
   - Normalize `constraint_table` fields.
   
   - Ensure logic for inclusion/exclusion of periods, venues, and exams is modular.
 
   - All timetable generation constraints are centralized constraint_table.

   - Constraint columns (periodIncE, periodExcE, venueIncE, venueExcE, periodIncV, periodExcV, examWAftE, examExcE) are VARCHAR-delimited strings, interpreted by the algorithm parsing logic.

   - Frontend/UX: Provide structured input forms ( input chip with ON CLICK OPENS period selector) that serialize into the delimited string format mainly study the current system and how to refactor.

   -  Strong validation on constarints input with a search filter behaviour upon inputs to select the intended ccourses for validation!!!.

   - Backend: Do not normalize constraints; store raw strings. Ensure API validation to prevent malformed entries (e.g., invalid course codes, periods, or venues)

   - Versioning & Audit: Track updates to constraint_table with timestamps to allow rollback or re-generation with previous constraints and selecting previous constraints config.


4. **Algorithm Integration**
   - Make optimization and scheduling algorithm pluggable.
   - Store algorithm parameters in DB config tables (`optimization settings`, `examtab`) instead of hardcoded values.

5. **Transactional Discipline**
   - Wrap multi-table updates in transactions.
   - Ensure rollback on failure to maintain data integrity.

6. **Course  reg**
   1. **Enrollment first:** Treat `student_semester_registration` as authoritative for active students
   2. **Course registration second:** Only allow rows in `registration` if enrollment exists



---

## **4. Frontend / UX Refactor Tasks**

**Goal:** Maintain UI functionality and business rules intact while cleaning up UX.

**To-Do:**

1. **UI Consistency**
   - Standardize form layouts across `course`, `student`, `staff`, `venue` management pages.
   - Validate inputs at form level before API calls.
   - Display error messages clearly for failed operations (registration, course creation).

2. **State Management**
   - Consolidate **Zustand store** for central app state.
   - Ensure **React Query** caching aligns with backend API changes.

3. **Triggering Generation**
   - Create **dedicated button/UI flow** for timetable generation.
   - Disable unrelated controls during generation.
   - Show progress feedback using `display_progress` from DB.

5. **Future-Proofing**
   - Ensure components can accept **dynamic configuration** (sessions, periods, exam types) from backend.

---

## **5. Textual Architecture Diagram (Refactored Focus)**

```
Frontend (React + TS)
│
├─ Login & Auth UI
├─ Admin / Dept / College Dashboards
├─ Student / Staff / Course Management UI
└─ Timetable Generation Trigger (UI Button)
       │
       ▼
Backend API (Spring Boot)
│
├─ Controllers (REST Endpoints)
├─ Services (Business Logic)
│   ├─ StudentService
│   ├─ CourseService
│   └─ TimetableGenerationService
├─ Repositories (JPA)
└─ DB Integration Layer
       │
       ▼
Database (MySQL)
│
├─ Core Tables (centre, department, program, student, staff, course, venue)
├─ Registration Tables (course_registrations, studentsemreg)
├─ Configuration Tables (constraint_table, optimization settings, main_interface)
└─ Audit / Logging Tables
```

---

## **6. High-Level To-Do Execution Flow**

1. Audit and document all controllers → consolidate endpoints.
2. Refactor services → ensure transactional integrity.
3. Audit DB schema → normalize config and constraint tables.
4. Implement access control at service layer.
5. Refactor front-end forms and state management → ensure business logic intact.
6. Integrate timetable generation API → connect to backend services.
7. Test full generation workflow → validate against existing DB data.
8. Add audit logging → track high-volatility changes.
9. Optimize DB indexes and queries.
10. Deploy locally and verify end-to-end functionality.

Here’s a structured, **execution-ready To-Do checklist** always take not e and prepare a to-do

```
+---------------------------------------------------------------+
| Bells University Timetable Generator - Refactor To-Do        |
| Execution-Ready Checklist (Step-by-Step)                     |
+--------------------------+---------+----------+--------------+
| Task                     | Owner   | Priority | Status       |
+--------------------------+---------+----------+--------------+
| 1. API layer for timetable | Backend | High     | Pending     |
|    generation trigger      |         |          |              |
+--------------------------+---------+----------+--------------+
| 2. Decouple core logic    | Backend | High     | Pending     |
|    from frontend           |         |          |              |
+--------------------------+---------+----------+--------------+
| 3. Refactor DB schema     | DB      | High     | Pending     |
|    to ensure modularity,  |         |          |              |
|    flexibility, and stable|         |          |              |
|    hierarchies            |         |          |              |
+--------------------------+---------+----------+--------------+
| 4. Implement policy       | Backend | High     | Pending     |
|    enforcement layer      |         |          |              |
+--------------------------+---------+----------+--------------+
| 5. Audit access flows     | Backend | Medium   | Pending     |
|    (user → data)          |         |          |              |
+--------------------------+---------+----------+--------------+
| 6. Define "what changes,  | Backend | Medium   | Pending     |
|    what never changes"    |         |          |              |
+--------------------------+---------+----------+--------------+
| 7. Threat-model review    | Backend | Medium   | Pending     |
|    (conceptual, non-SQL)  |         |          |              |
+--------------------------+---------+----------+--------------+
| 8. Frontend UI/UX refactor | Frontend | High   | Pending     |
|    for admin & staff dashboards |      |          |              |
+--------------------------+---------+----------+--------------+
| 9. Integrate React Query  | Frontend | Medium  | Pending     |
|    & Zustand state mgmt    |         |          |              |
+--------------------------+---------+----------+--------------+
| 10. Configure REST API    | Backend  | High    | Pending     |
|     endpoints for CRUD    |         |          |              |
+--------------------------+---------+----------+--------------+
| 11. Verify entity         | DB      | High     | Pending     |
|     relationships & FK    |         |          |              |
|     integrity             |         |          |              |
+--------------------------+---------+----------+--------------+
| 12. Migrate volatile      | DB      | Medium   | Pending     |
|     vs stable data        |         |          |              |
|     classification        |         |          |              |
+--------------------------+---------+----------+--------------+
| 13. Add API triggers for  | Backend | Medium   | Pending     |
|     output tab / examtab  |         |          |              |
+--------------------------+---------+----------+--------------+
| 14. Document business     | Backend | Medium   | Pending     |
|     logic flows           |         |          |              |
+--------------------------+---------+----------+--------------+
| 15. Prepare DB backup &   | DB      | High     | Pending     |
|     migration scripts     |         |          |              |
+--------------------------+---------+----------+--------------+
| 16. QA functional flow    | Frontend/Backend | High | Pending |
|     (registration → timetable → report)| |      |              |
+--------------------------+---------+----------+--------------+
| 17. Setup centralized     | Backend | Medium   | Pending     |
|     logging & monitoring  |         |          |              |
+--------------------------+---------+----------+--------------+
| 18. Implement RBAC checks | Backend | High     | Pending     |
|     for all controllers   |         |          |              |
+--------------------------+---------+----------+--------------+
| 19. Unit test core        | Backend | High     | Pending     |
|     logic & API           |         |          |              |
+--------------------------+---------+----------+--------------+
| 20. Integrate CSV/PDF     | Backend/Frontend | Medium | Pending |
|     export functionality  |         |          |              |
+--------------------------+---------+----------+--------------+
| 21. Perform full system   | Backend/DB/Frontend | High | Pending |
|     integration test      |         |          |              |
+--------------------------+---------+----------+--------------+
| 22. Update PRD & dev      | Backend/Frontend/DB | Medium | Pending |
|     docs with refactor    |         |          |              |
+--------------------------+---------+----------+--------------+
```

**Execution Notes:**

1. **Owner Assignment**: Clear separation—Backend handles logic/API/policy, DB handles schema/integrity/volatility, Frontend handles UI/UX and state.
2. **Priority Definition**: Critical tasks for immediate production stability or functionality marked as High.
3. **Status**: Starts as Pending; update to In-Progress / Done as development proceeds.
4. **AI Agent Integration**: Can consume this checklist directly to sequence code generation and testing.
