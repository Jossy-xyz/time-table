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
- [x] **STB-04**: **Model-Schema Harden**: Standardized `constraint_table` to snake_case and explicitly mapped all entity fields to prevent Hibernate naming collisions (Unknown column errors). (Done)

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
- [x] **BE-08**: **Algorithm Trigger API**: Extend initialization logic to optionally ping/trigger the core algorithm engine. (Moved from Phase 7)

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
- [x] **BE-02**: Implement **Constraint Snapshots** (Append-only storage: New ID on every save, retrieval by timestamp/name) (Done)
- [x] **BE-02B**: Database Schema Refactor: Add `name` column to `constraint_table` for versioning/snapshots. (Done)
- [x] **BE-02A**: Expand `GeneralSettings` to include:
  - Examination Category (Regular, TopUp, Part-Time, Online - default: Regular)
  - Campus Type (Single or Multi - default: Single)
  - Examination Level to Schedule (All or selected Levels - default: All)
  - No. of Weeks for Exam Duration (calculated from start-end date, floored up) (Done)
- [x] **FE-06**: Create `generalSettingsService.ts` for Global Config (Session, Grid logic) (Verified)
- [x] **FE-07**: Implement **History & Restore UI** (Dropdown to view/load from Snapshot history and other general settings configuration) (Done)
- [x] **FE-08**: Dynamic **Timetable Grid** (Initialize based on loaded configuration) (Done)
- [x] **BE-02C**: **Period Exclusion Backend**:
  - [x] Database: `period_exclusion_snapshots` table created (Manual execution + Schema update)
  - [x] Entities: `PeriodExclusionSnapshot.java` (using jakarta.persistence)
  - [x] Services: `PeriodCalculationService`, `PeriodExclusionService`, `PeriodExclusionValidator`
  - [x] API: `PeriodExclusionController` (5 endpoints: mapping, active, save, history, activate)
  - [x] Integration: `SchedulerServiceImpl` updated to read exclusions
- [x] **FE-11**: Create **Calendar Period Selector** component (Week-based grid with date mapping)
- [x] **FE-12**: Implement period index calculation logic (Done in Backend, Frontend consumes)
- [x] **FE-13**: Integrate Calendar Selector with constraint settings and persist excluded periods
- [x] **FE-09**: **Dashboard Refactor**: Resolved compilation errors, fixed useCallback dependencies, and synced with management services. (Done)
- [x] **FE-10**: **Pre-Flight Checklist UI**: Implement "Circle-Tick" status dashboard in TimetablePage to verify all constraints/settings are ready before enabling generation.

## 🏗️ PHASE 8: ENTERPRISE ROBUSTNESS (FROM BACKEND PLAN)

- [x] **BE-03**: **Global Exception Handling**: Implement `@ControllerAdvice` to standardize error response JSON. (Done)
- [x] **BE-08**: **Backend API Audit**: Comprehensive security and logic audit of all controllers and services. (Done - Feb 2026)
  - [x] **BE-08A**: Verified RBAC enforcement across all critical endpoints
  - [x] **BE-08B**: Fixed NPE vulnerability in `Registrationserviceimp.saveRegistration` (now fetches managed entities)
  - [x] **BE-08C**: Fixed NPE vulnerability in `StudentSemesterRegistrationserviceimp.saveStudentSemesterRegistration`
  - [x] **BE-08D**: Confirmed service-layer RBAC delegation pattern in Course/Staff/Student/Venue controllers
  - [x] **BE-08E**: Updated `ENDPOINT_LIST.md` with RBAC annotations and security notes
- [ ] **BE-04**: **API Versioning**: Prefix endpoints with `/api/v1` for forward compatibility.
- [ ] **BE-05**: **Soft Delete Logic**: Implement `is_active` flag for Staff, Venue, and Course entities.
- [ ] **BE-06**: **Audit Logging**: Implement `@EntityListeners` for `AuditingEntityListener` to track `created_by`/`modified_by`.
- [ ] **BE-07**: **Repository Caching**: Integrate JPA second-level cache or manual caching for high-read reference data.
- [ ] **FE-14**: **Tooltip System**: Implement comprehensive tooltips/help system for user guidance
  - [ ] **FE-14A**: Create reusable `Tooltip` component with hover/click triggers
  - [ ] **FE-14B**: Add tooltips to Institutional Constraints section
  - [ ] **FE-14C**: Add tooltips to Period Exclusion Calendar
  - [ ] **FE-14D**: Add tooltips to General Settings
  - [ ] **FE-14E**: Add tooltips to Pre-Flight Checklist
  - [ ] **FE-14F**: Add tooltips to Algorithm Trigger
- [ ] **FE-15**: **UX Polish**: Add loading states, success animations, and error recovery flows

## 🏁 PHASE 9: ALGORITHM FINALIZATION & SLOT SYNC

- [x] **ALG-04**: Implement **Total Potential Slot Calculation** (DaysPerWeek _ PeriodsPerDay _ ExamWeeks) - ExcludedSlots. (Done)
- [x] **ALG-05**: Ensure 0-based global indices from `PeriodExclusionSnapshot` align with algorithm slot logic. (Done)
- [x] **ALG-06**: Implement **Capacity Pre-flight Check**: `Total Slots >= Total Courses to Schedule`. (Done)
- [x] **ALG-07**: **Generation View Sync**: Display "Active Exclusion Count" in the finalized Generation dashboard. (Implied complete via Dashboard refactor)

## 🌐 PHASE 10: DISTRIBUTED GENERATION & EDGE ORCHESTRATION (PREP)

- [ ] **DIST-01**: **External Endpoint Configuration**: Decouple generation API from local Spring context.
- [ ] **DIST-02**: **Environment variable Injection**: Implement `ALGORITHM_NODE_URL` in `application.properties`.
- [ ] **DIST-03**: **Webhook / Callback Logic**: Implement a "Completion Callback" endpoint (`/api/algorithm/callback`).
- [ ] **DIST-04**: **Status Polling Refactor**: Update `optimization_settings` polling for external orchestration.
- [ ] **DIST-05**: **CORS & Security**: Update Backend Security config for External Engine IP.

## 🛡️ PHASE 11: INVIGILATOR CONSTRAINTS (NEW)

- [x] **INV-01**: **Backend Schema Update**: Add `staff_omit` and `staff_period_excl` columns to `constraint_table`. (Done)
- [x] **INV-02**: **Entity & DTO Refactor**: Update `Constrainttable.java` and `ConstraintDto.java`. (Done)
- [x] **INV-03**: **Frontend Type Alignment**: Update `institutional.ts` to include invigilator constraint fields. (Done)
- [x] **INV-04**: **Constraint UI: Staff Omission**: Implement UI for selecting staff who are unavailable for the entire session. (Done)
- [x] **INV-05**: **Constraint UI: Period-Specific Exclusions**: Implement UI for selecting staff unavailability for specific slots. (Done)
- [x] **INV-06**: **UX Polish: Mini-Temporal Matrix**: Refactor `PeriodSlotSelector` into a compact, date-picker-like version of the `CalendarGrid` (Mental Model Sync). (Done)
- [x] **INV-07**: **Grid Pagination**: Implement pagination/week-selection for the constraint period grid to handle multi-week schedules. (Done)
- [x] **INV-08**: **Conceptual Mapping**: Ensure UI maps raw integers to "Day/Period" labels to aid non-experts. (Done)
- [x] **INV-09**: **Algorithm Integration**: Update the generation payload to include invigilator constraints for the solver engine. (Done)
- [x] **INV-10**: **Architectural Milestone**: Documentation of "Exclusion Mask" and "Day/Date Mapping" completed in `ALGORITHM_INTEGRATION_SPECS.md`. (Done)

---

## 📈 PHASE 12: EXCLUSION MASKING & PRE-FLIGHT DIAGNOSTICS

- [x] **DIAG-01**: **Exclusion Masking**: Update `PeriodSlotSelector` to fetch and visually disable periods already marked as "Excluded" in the active snapshot. (Done)
- [x] **DIAG-02**: **Capacity Reporting**: Implement a real-time count of "Net Available Slots" (Total - Excluded) in the generation UI. (Done)
- [x] **DIAG-03**: **Constraint Conflict Detection**: Basic validation to alert user if a hard constraint (e.g., Period Inclusion) targets an Excluded Slot. (Done)
- [x] **DIAG-04**: **UI Polish**: Update `PeriodSlotSelector` labels to use the standardized `Tue 24th | P1` format. (Done)

---

## 🏗️ PHASE 13: CORE INSTITUTIONAL PARAMETERS

- [x] **CORE-01**: **Missing Fields**: Added `Exam Category`, `Campus Type`, and `Exam Level` to the General Orchestration form. (Done)
- [x] **CORE-02**: **Automatic Duration**: Implemented automated "Week Calculation" (Floor-Up) based on start/end dates. (Done)
- [x] **CORE-03**: **Mental Alignment**: Synchronized default values (Regular, Single Campus, Level: All) with user requirements. (Done)

---

---

## 📦 PHASE 14: INSTITUTIONAL CONTEXT PERSISTENCE & UNIVERSAL SYNC

- [ ] **SYNC-01**: **Global Context Store**: Implement a Zustand store to manage the "Active Triad" (`activeGS`, `activeConstraint`, `activeExclusion`).
- [ ] **SYNC-02**: **Reactive Grid Topology**: Ensure the Constraint Builder and Temporal Matrix modules reacti
      vely update their grid geometry when General Settings are modified.
- [ ] **SYNC-03**: **Auto-Promotion Logic**: Automatically update the Selection Store with the newly created ID after any successful Database Save/Snapshot action.
- [ ] **SYNC-04**: **Cross-Page Persistence**: Sync the selection store with `localStorage` and URL parameters to maintain configuration context during navigation.
- [ ] **SYNC-05**: **Topology Integrity Guard**: Implement a validator that flags "Orphaned Snapshots"—constraints or exclusions built for a grid size that no longer matches the active General Settings.

---

## 🧠 PHASE 15: INSTITUTIONAL LOGIC & MENTAL MODEL ALIGNMENT

- [ ] **MODEL-01**: **Sequential Selection Flow**: Implement the Two-Step logic for composite constraints:
  - **Type A (Entity + Grid)**:
    - _Period Inclusive Exams_: Search **Course** -> Open **Calendar Grid**.
    - _Period Inclusive Venues_: Search **Venue** -> Open **Calendar Grid**.
    - _Invigilator Exclusions_: Search **Staff** -> Open **Calendar Grid**.
  - **Type B (Entity + Entity)**:
    - _Venue Exclusive Exams_: Search **Venue** -> Open **Course Picker**.
    - _Venue Inclusive Exams_: Search **Venue** -> Open **Course Picker**.
    - _Academic Sequence (After/Exclusive/Coinciding)_: Search **Course** -> Open **Course Picker**.
  - **Type C (Immediate / Single-Step)**:
    - _Front Loaded Exams_: Search **Course** -> Add.
    - _Staff Omission_: Search **Staff** -> Add.
- [ ] **MODEL-02**: **Selector Inversion**: Refactor `VenueSlotSelector` to intelligently swap between "Registry Mode" (Venues) and "Course Mode" (Courses) based on the Sector Key.
- [ ] **MODEL-03**: **String Builder Alignment**: Ensure `getConstraintsForDB` generates keys based on the search subject (Venue vs Course).
- [ ] **MODEL-04**: **Edit Pattern Mapping**: Ensure clicking an existing chip re-opens the specific secondary selector (Grid vs Picker) required for that category.

---

## 🕒 PHASE 16: MONDAY-ANCHORED TEMPORAL MATRIX (NEW)

- [x] **TIME-01**: **Backend: Monday Anchor Implementation**:
  - [x] Update `PeriodMapping` DTO to include `isSystemLocked` boolean.
  - [x] Refactor `PeriodCalculationService.java` to find the preceding Monday of `startDate` and use it as the 0-index anchor.
  - [x] Implement logic to mark slots as `isSystemLocked` if `date < startDate` or `date > endDate`.
- [x] **TIME-02**: **Frontend: Stable Indexing Migration**:
  - [x] Update `CalendarGrid.tsx` and `PeriodSlotSelector.tsx` to handle the `isSystemLocked` property.
  - [x] Visually disable and auto-exclude locked periods in the UI.
  - [x] Ensure the global incrementing identifiers (1, 2, 3...) remain stable (Slot 0 is always Monday Morning).
- [x] **TIME-03**: **Cross-Module Validation**:
  - [x] Verify that all constraints (Period Inclusive, etc.) correctly map to the new anchored indices.
  - [x] Update generation payload to include system-locked indices by default in the `excludedPeriods` array.

---

_Status: 90% Functional Alignment (Temporal refinement in progress)_

## 🕒 TEMPORAL SCENARIOS (Monday Anchor)

### Scenario A: Wednesday Start

- **Dates**: Start Wed (June 4), End Tue (June 17).
- **Anchor**: Mon (June 2).
- **Indices 0-14 (Mon-Tue)**: marked `isSystemLocked=true`.
- **Slot 15**: Wednesday Morning (P1).
- **Result**: Even if the session opens Wednesday, the first two days of indices are "reserved" to prevent ID shifting.

### Scenario B: Universal Communication

- Coordinator says: "Exclude **Slot 0**".
- In **ALL** sessions (Regular, TopUp, Part-time), Slot 0 refers to **Monday Morning, Week 1**, regardless of whether their specific exam starts Monday or Friday.

### Scenario C: Weekend Buffer

- Indices for Saturday/Sunday are generated if `daysPerWeek=5`.
- They are marked `isSystemLocked=true`.
- This ensures Monday of Week 2 always follows a predictable mathematical skip from Friday of Week 1.

---

## 📝 NOTES & CLARIFICATIONS

- **Invigilator Constraints**:
  - (i) **Staff to omit** (by ID, e.g. BUT/0235): Staff who will not be available throughout the examination period.
  - (ii) **Periods exclusive to invigilators** (e.g. BUT/0235 (4,9,10,11)): Staff with assignments or permissions to be away on certain days or periods.
- **Access Control**:
  - [x] **Venues Tab**: Accessible by **College Rep (CR)** and **Admin (AD)** only. (Restricted for DR/ST)
  - [x] **Operations Hub / Timetable Generation**: Strictly **Admin (AD)** only.
  - [x] **Configuration**: Settings modification restricted to **Admin (AD)**.

- **Dashboard**:
  - [ ] **User Identity**: The dashboard should be able to show the actual user name from the staff table (currently showing session/account name).

- **Slot Counting**: The system must report both "Gross Slots" (total grid size) and "Net Slots" (available for allocation) at the point of generation.
- **Distributed Node**: The core solver will reside on a dedicated high-compute machine. Communication must follow the **Triple-Lock ID Bundle** pattern documented in `ALGORITHM_INTEGRATION_SPECS.md`.
- **Period Persistence**: Determine if the global period indices (e.g., 0-49) should be explicitly persisted in the database for consistency across sessions.
