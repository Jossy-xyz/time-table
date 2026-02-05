# 🗺️ Bells University Timetable Generator: Strategic Refactor Plan

This document outlines the architectural strategy and high-level milestones for transitioning the system to a Zero-Trust, Layered Institutional Architecture.

---

## 🏗️ 1. Architectural Strategy

### 1.1 The "Bones" Layer (Persistence & Entities)

- **Strategy**: Strict adherence to `schema2.sql`. Every Java entity must mirror the MySQL table exactly.
- **Principle**: Circular references are handled via **DTOs** to prevent JSON serialization recursion.
- **Volatility**:
  - **Stable**: Reference data (Centres, Roles).
  - **Semi-Volatile**: Operational data (Students, Courses).
  - **Highly Volatile**: Transactional data (Registrations, Schedules).

### 1.2 The "DIV" Layer (Database Interaction Verification)

- **Strategy**: All mutations (Save/Update/Delete) must pass through a `PolicyEnforcementService`.
- **Mechanism**: The `X-Actor-Username` header is required for all mutation requests.
- **Constraint**: No student can exist without an enrollment record (`student_semester_registration`).

### 1.3 The "Algorithm" Layer (The Brain)

- **Strategy**: Decouple timetable generation from the request-response cycle.
- **Logic**: Constraints are stored as structured strings but parsed by a dedicated service.
- **Output**: Timetables are generated into `output_tab` and `examtab` tables rather than being held in memory.

---

## 🎯 2. High-Level Milestones

### PART A: Structural Integrity (COMPLETED)

1.  **Schema Alignment**: Unified `examtt2` as the single source of truth.
2.  **Entity Cleanup**: Synchronized Java models with DB constraints.
3.  **Security Bootstrap**: Integrated BCrypt and Role-based scoping (PEL).

### PART B: Business Logic Hardening (COMPLETED)

1.  **Refactoring Controllers**: Switched from returning Entities to **DTOs** (All major controllers updated).
2.  **Securing Secondary Domains**: Implemented DIV for Program, Venue, and Staff management.
3.  **Transactional Audit**: Ensured all cross-table updates are atomic using `@Transactional`.

### PART C: Functional Polish & Algorithm (CURRENT)

1.  **Constraint Parser**: Coding the regex/logic to interpret strings like `CHM(0,1);PHY(2,3)`.
2.  **Frontend Sync**: Updating the React UI to consume DTOs and maintain global state via Zustand.
3.  **Progress API**: Setting up the polling mechanism for Timetable Generation progress.
4.  **Schedule Orchestration**: Restoring `GeneralSettings` to define grid dimensions (Settings Page) and interactive period selection for algorithm triggering (Timetable Page).
5.  **Algorithm Trigger**: Implementing the API to accept the finalized grid state and kick off the scheduler engine.
6.  **Configuration Status Checks**: Implementing a pre-flight checklist UI (circle-tick design) to verify all configurations (Constraints, Semester, Load) are satisfied before initialization.

---

## 🛠️ 3. Development Guidelines

1.- [x] **Zero Direct DB Access**: Enforce Controller -> Service -> Repository pattern.

- [x] **Period Exclusion Feature**:
  - [x] Database Schema (`period_exclusion_snapshots`)
  - [x] Backend Implementation (Entities, DTOs, Services, Controller)
  - [x] Frontend UI (Calendar Grid)
- [x] **Snapshot Versioning (History)**: Added Snapshot Registry sidebar for archiving/restoring versions.
- [x] **Elite UI Redesign**: Implemented premium institutional aesthetic (Brick/Gold/Glass).
- [x] **Algorithm Integration**: Pass exclusion constraints to the core engine.

2.  **Header Integrity**: All Frontend API calls must include the `X-Actor-Username`.
3.  **Naming Convention**:
    - Controllers: `Domaincontroller.java` (Lowercase 'c').
    - Models: `Domain.java` (Capitalized).
    - DTOs: `DomainDto.java`.
4.  **Error Handling**: Throw `RuntimeException` with descriptive messages; caught by a global handler (upcoming).

---

## 🏁 4. Definition of Done

- [ ] Backend compiles with 0 errors.
- [ ] Frontend reflects "Access Denied" for unauthorized role scopes.
- [ ] A student can successfully register ONLY if enrolled for the current session.
- [ ] Timetable generation reads constraints from the new `constraint_table` and writes to `output_tab`.

## 5. DEv To-do

- [x] A nodemon like functionality for restarting the server upon main java server files updates (See [Backend Dev Guide](./Backend/untitled2/DEVELOPMENT_GUIDE.md))
