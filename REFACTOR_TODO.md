# 📋 BELLS UNIVERSITY REFACTOR: IMPLEMENTATION TODO

This document tracks the progress of the structural refactor (DB + Backend Alignment).

---

## ✅ PHASE 1: DATABASE INITIALIZATION

- [x] **DB-01**: Create `examtt2` database using `Database/schema2.sql`
- [x] **DB-02**: Verify table structures and foreign key constraints
- [x] **DB-03**: Seed basic reference data (Roles: AD, CR, DR, ST seeded by user)

## ✅ PHASE 2: ENTITY REFACTOR (THE BONES)

- [x] **EN-01**: Refactor `Registration.java`
- [x] **EN-02**: Rename and Refactor `Studentsemreg.java` -> `StudentSemesterRegistration.java`
- [x] **EN-03**: Refactor `Student.java`, `Course.java`, `Staff.java`, `Program.java`, `Venue.java`
- [x] **EN-04**: Refactor `Users.java` & `Role.java`
- [x] **EN-05**: Update `ConstraintTable.java` & `Algorithmtable.java`
- [x] **EN-06**: Refactor all 17 Repositories to align with new model naming

## ⚙️ PHASE 3: BUSINESS LOGIC & DIV (STABILITY LAYER)

- [x] **LG-01**: Implement **Enrollment-First** logic in `RegistrationService`
- [x] **LG-02**: Implement **Policy Enforcement Layer (PEL)** (Role-based department/college scoping)
- [x] **LG-03**: Implement **Database Interaction Verification (DIV)**
  - [x] Pre-verification checks for Registration, Student, and Course
  - [x] Pre-verification for Venue, Program, Staff (Done)
- [x] **LG-04**: **Transactional Integrity**: Audit all mutation methods for `@Transactional`
- [x] **STB-01**: **Robustness Sweep**: Fix 500 errors across all fetch endpoints (Done)
- [x] **STB-02**: **Full Schema Parity**: Restored legacy oversight attributes to align with 100% of functional requirements (Staff Title, Venue Actual Capacity, Course Hours, Student Program Name) (Done)
- [x] **STB-03**: **Data Audit**: Verified `seed_data_refactored.sql` contains all newly added oversight columns. (Done)

## ✅ PHASE 4: SECURITY & API STANDARDIZATION

- [x] **SEC-01**: Implement **BCrypt** password hashing for `Users`
- [x] **API-01**: Create **DTOs** for major entities (StudentDto, CourseDto, etc.)
- [x] **API-02**: Refactor **Controllers** to return DTOs and handle `actorUsername` headers
  - [x] Studentcontroller (Done)
  - [x] Coursecontroller (Done)
  - [x] Staffcontroller (Done)
  - [x] Registrationcontroller (Done)
  - [x] All Remaining Controllers (Venue, Program, Centre, etc.) (Done)

## ⚙️ PHASE 5: THE INTERFACE LAYER (CONSTRAINTS & SETTINGS)

- [x] **ALG-01**: Implement **Constraint Storage API** (Done)
- [x] **ALG-02**: Decouple **Timetable Trigger API** from old logic (Done)
- [x] **ALG-03**: Implement Real-Time **Progress Polling** via `optimization_settings` (Done)
- [ ] **BE-08**: **Algorithm Trigger API**: Extend initialization logic to optionally ping/trigger the core algorithm engine. (Moved from Phase 7)

## ⚛️ PHASE 6: FRONTEND SYNCHRONIZATION

- [x] **FE-01**: Update `apiClient` to globally inject `X-Actor-Username`
- [x] **FE-02**: Migrate Authentication state to **Zustand** (AuthStore and useAuth hooks finalized)
- [x] **FE-03**: Sync Frontend Types with Backend **DTOs** (Institutional.ts aligned)
- [x] **FE-04**: Implement **Constraint Builder UI** (Input Chips & Validation)
- [x] **FE-05**: Refactor **Management Interfaces**: Updated StaffList, StudentList, and CourseList to handle multi-component names (Title/Surname/Firstname) and detailed attributes. (Done - Backend sync verified)

## 💾 PHASE 7: PERSISTENCE, VERSIONING & CONFIGURATION

- [x] **BE-01**: Restore **GeneralSettings** (formerly `main_interface`) Entity + Controller. (Verified)
  - **Purpose**: Store "Schedule Orchestration" configs (`days_per_week`, `periods_per_day`, `session`, `semester`, `start_date`, `end_date`) required by the core algorithm.
  - **Action**: Create `GeneralSettings` entity, `GeneralSettingsRepository`, and `GeneralSettingsController`.
- [ ] **BE-02**: Implement **Constraint Snapshots** (Append-only storage: New ID on every save, retrieval by timestamp/name)
- [ ] **BE-02B**: Database Schema Refactor: Add `name` column to `constraint_table` for versioning/snapshots.
- [ ] **BE-02A**: Expand `GeneralSettings` to include:
  - Examination Category (Regular, TopUp, Part-Time, Online - default: Regular)
  - Campus Type (Single or Multi - default: Single)
  - Examination Level to Schedule (All or selected Levels - default: All)
  - No. of Weeks for Exam Duration (calculated from start-end date, floored up)
- [x] **FE-06**: Create `generalSettingsService.ts` for Global Config (Session, Grid logic) (Verified)
- [ ] **FE-07**: Implement **History & Restore UI** (Dropdown to view/load from Snapshot history and other general settings configuration)
- [x] **FE-08**: Dynamic **Timetable Grid** (Initialize based on loaded configuration)
- [ ] **BE-02C**: Create `period_exclusion_snapshots` table and API endpoints for period mapping/exclusions
- [ ] **FE-11**: Create **Calendar Period Selector** component (Week-based grid with date mapping)
- [ ] **FE-12**: Implement period index calculation logic (date + period → global index conversion)
- [ ] **FE-13**: Integrate Calendar Selector with constraint settings and persist excluded periods
- [x] **FE-09**: **Dashboard Refactor**: Resolved compilation errors, fixed useCallback dependencies, and synced with management services. (Done)
- [x] **FE-10**: **Pre-Flight Checklist UI**: Implement "Circle-Tick" status dashboard in TimetablePage to verify all constraints/settings are ready before enabling generation.

## 🏗️ PHASE 8: ENTERPRISE ROBUSTNESS (FROM BACKEND PLAN)

- [ ] **BE-03**: **Global Exception Handling**: Implement `@ControllerAdvice` to standardize error response JSON.
- [ ] **BE-04**: **API Versioning**: Prefix endpoints with `/api/v1` for forward compatibility.
- [ ] **BE-05**: **Soft Delete Logic**: Implement `is_active` flag for Staff, Venue, and Course entities.
- [ ] **BE-06**: **Audit Logging**: Implement `@EntityListeners` for `AuditingEntityListener` to track `created_by`/`modified_by`.
- [ ] **BE-07**: **Repository Caching**: Integrate JPA second-level cache or manual caching for high-read reference data.
- [ ] **FE-14**: **Tooltip System**: Implement comprehensive tooltips across Settings UI (constraints, period selector, algorithm trigger)
- [ ] **FE-15**: **UX Polish**: Add loading states, success animations, and error recovery flows

---

_Status: 94% Complete (Architecture finalization in progress)_
