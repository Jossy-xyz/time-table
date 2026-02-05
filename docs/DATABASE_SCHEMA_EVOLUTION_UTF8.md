# Database Schema Evolution: Refactoring from v1 (`schema.sql`) to v2 (`schema2.sql`)

This document captures the complete history of database schema refactoring for the Timetable Generator system. It serves as the single source of truth for understanding how the data model has evolved to support modernization, better data integrity, and new features like versioning.

---

## ðŸ—ï¸ High-Level Architectural Changes

The transition from v1 to v2 focused on **normalization**, **standardization**, and **cleanup**.

| Feature               | Legacy v1 (`schema.sql`)                                | Modern v2 (`schema2.sql`)                                                   | Rationale                                                   |
| :-------------------- | :------------------------------------------------------ | :-------------------------------------------------------------------------- | :---------------------------------------------------------- |
| **Naming Convention** | Inconsistent (e.g., `studentsemreg` vs `registration`)  | Standardized `snake_case` (e.g., `student_semester_registration`)           | Improves readability and consistency across the codebase.   |
| **Keys & Indexes**    | Mixed types (`int(11)`, `varchar`), some missing FKs    | Standardized `INT`/`BIGINT` for IDs, explicit FK constraints                | Ensures referential integrity and cleaner relationships.    |
| **Audit Trails**      | None                                                    | `created_at TIMESTAMP` on almost all tables                                 | Critical for tracking when records were created (auditing). |
| **Entity Clean-up**   | Included temp/unused tables (`slashedcourse`, `examtt`) | Removed all obsolete tables                                                 | Removes technical debt and confusion.                       |
| **Hierarchy**         | Flat/Mixed dependencies                                 | Strict 4-Level Hierarchy (Organization â†’ Academic â†’ Transactional â†’ Config) | Simplifies dependency management and seed data loading.     |

---

## ðŸ”„ Detailed Table-by-Table Evolution

### 1. Organizational Structure (Hierarchy Level 0-1)

#### `centre` (Colleges/Campuses)

- **Renamed columns:** `encount` removed (calculated dynamically now).
- **Added:** `created_at`.
- **Logic:** `type` column explicitly defined relative to system constants (1=College, etc.).

#### `department`

- **Foreign Key:** Changed `college_id` -> `centre_id` to align with the table name `centre`.
- **Added:** `created_at`.

#### `venue`

- **Foreign Key:** Changed `college_id` -> `centre_id`.
- **Standardized:** `Capacity`, `Type`, `Preference` lowercased to `capacity`, `type`, `preference`.
- **Added:** `created_at`.

### 2. Academic Entities (Hierarchy Level 2)

#### `program`

- **Foreign Key:** `dept_id` -> `department_id`.
- **Removed:** `new_codeid` (legacy artifact).
- **Added:** `entry_req` (text) for fuller details, `created_at`.

#### `course`

- **Foreign Key:** `dept_id` -> `department_id`, `college_id` removed (redundant, inferred via dept).
- **Renamed:** `examtype` -> `exam_type`.
- **Added:** `created_at`.

#### `staff`

- **Foreign Key:** `dept_id` -> `department_id`.
- **Renamed:** `statusID` -> `status_id`.
- **Type Change:** `in_use` from `int` to `tinyint(1)` (boolean flag).
- **Added:** `created_at`.

#### `student`

- **Keys:** `Id` (capitalized) -> `id`. `matric_no` retained as unique business key.
- **Foreign Keys:** `dept_id` -> `department_id`, `program_id` kept.
- **Added:** `created_at`.

### 3. Transactional Data (Hierarchy Level 3)

#### `users`

- **Foreign Key:** `role` (int) -> `role_id` (explicit FK).
- **Links:** added `staff_id` reference to `staff` table for instructor logins.
- **Added:** `created_at`.

#### `role`

- **Renamed:** `staffRole` -> `name`.
- **Values:** Inserted default constants (ADMIN, COLLEGE_REP, DEPARTMENT_REP, STAFF).

#### `student_semester_registration` (was `studentsemreg`)

- **Renamed:** Entire table renamed for clarity.
- **Structure:** Normalized relationship between Student + Session + Semester.
- **Constraint:** Added `UNIQUE(student_id, session, semester)` to prevent duplicate sem registrations.

#### `registration` (Course Registration)

- **Refactor:** Now references `student_semester_registration` instead of duplicating session/semester raw data strings repeatedly.
- **Foreign Keys:** Linked to `course_id` instead of `course_code` string.
- **Constraint:** `UNIQUE(student_id, course_id, session)` covers re-takes logic.

### 4. Configuration & Settings (Hierarchy Level 4)

#### `general_settings` (was `main interface`)

- **Renamed:** `main interface` -> `general_settings`.
- **Structure:** Stores orchestration globals (`days_per_week`, `periods_per_day`, `start_date`, etc.).
- **Type:** `id` -> `BIGINT`.

#### `constraint_table`

- **Columns:** Retained column names like `periodIncE`, `periodExcE` for compatibility with algorithm for now, but ensured schema consistency.
- **Planned Refactor:** Will evolve to support JSON/Structured storage or "Constraint Snapshots" (see next section).

#### `optimization_settings` (was `optimization settings`)

- **Renamed:** `optimization settings` -> `optimization_settings` (snake_case).
- **Columns:** `int_mode`, `add_more_time` refactored/removed based on new algorithm needs.
- **Renamed:** `exam_w_time` -> `exam_weight_time`.

#### `output_tab` (was `output tab`)

- **Renamed:** `output tab` -> `output_tab`.
- **Cleaned:** Removed unused print flags (`usehalf_Vspace`, `sitting_arrangement`).

#### `examtab`

- **Retained:** Stores scheduling policies (`max_examl`, `min_examl`).
- **Added:** `created_at`.

---

## ðŸ”® Future Schema Evolution (Phase 7 & 8)

The following changes are planned to support **versioning** and **persistence**:

1.  **Constraint Versioning (BE-02B)**
    - Add `name` column to `constraint_table` (and potentially `optimization_settings`, `output_tab`).
    - Allows users to save named profiles (e.g., "Draft 1", "Final Semester Schedule").

2.  **Period Exclusions (New Table)**
    - Create `period_exclusion_snapshots` table.
    - Purpose: Store excluded periods as distinct snapshots rather than a CSV string in a generic table.
    - See `docs/period_exclusion_backend_design.md` for full spec.

3.  **Generated Timetables**
    - Future table `generated_timetables` to link specific output results back to the specific `constraint_snapshot_id` used to generate them.

---

## âš ï¸ Migration Notes

- **Data Migration:** Moving from v1 to v2 requires ETL (Extract-Transform-Load) scripts because foreign keys (e.g., `dept_id` vs `department_id`) and table names have changed.
- **Backward Compatibility:** The application code has been updated to reflect v2 entities (Entities in Java backend match `schema2.sql`).
