# Generation Logic Refactor Analysis

## Objective

Primary focus is to migrate **manual configuration and constraints** (Exams Settings, Solver Parameters, PIE/PEE) to the database (`examtt3` schema). Institutional data (Courses, Students, Reg) is already DB-driven; this refactor bridges the gap to make the entire execution environment automated and remote-ready.

## Current State Analysis (`TimetableAppCode.txt`)

The entry point contains large blocks of hardcoded configuration variables that must be moved to the database for seamless deployment on other machines.

## Configuration Mapping (Code to DB)

Below is the mapping for remaining hardcoded logic identified in `TimetableAppCode.txt`:

| Code Variable               | DB Table                     | DB Column             | Notes                                    |
| :-------------------------- | :--------------------------- | :-------------------- | :--------------------------------------- |
| `pPerDay`                   | `general_settings`           | `periods_per_day`     |                                          |
| `noOfWks`                   | `general_settings`           | `exam_weeks`          |                                          |
| `ttDaysPerWk`               | `general_settings`           | `days_per_week`       |                                          |
| `examSchedullingPolicy`     | `examtab`                    | `schedule_policy`     |                                          |
| `venueSelOrder`             | `output_tab`                 | `venue_alg_order`     |                                          |
| `venueSelPolicy`            | `output_tab`                 | `venue_alg`           |                                          |
| `selectStaffRand`           | `output_tab`                 | `select_staff_random` |                                          |
| `updateStaffDutyCount`      | `output_tab`                 | `update_staff_duty`   |                                          |
| `genCount`                  | `optimization_settings`      | `opt_cycle_count`     |                                          |
| `totTime` (optimization)    | `optimization_settings`      | `opt_time`            |                                          |
| `pNotAvailable` (Reg/TopUp) | `period_exclusion_snapshots` | `excluded_periods`    | Replaces hardcoded `reg`/`topUp` arrays. |

## Logical Recommendations (Infrastructure Improvements)

1.  **Selective Enrollment Database**: (Lines 490-509) are currently hardcoded for `FST310`, `GES302`. Recommend a `selective_exams_config` table to store `program_codes` and `levels` per course.
2.  **Non-Exam Registry**: (Lines 581-590) currently relies on `UniWideNonExamC.csv`. Recommend a `non_exam_courses` table to avoid file dependency.
3.  **Startup Date Logic**: (Lines 108-118) contains hardcoded dates. These should be pulled from `general_settings.start_date` and the code should calculate the Monday anchor dynamically using the already implemented `LocalDate` logic.

## Summary of Integration

Instead of manual code updates every semester, the logic machine will now run a **Static Routine**:

1.  Establish DB Connection.
2.  Call `DbConfigLoader` (Populates `cData`).
3.  Load Core Data (Courses/Staff/Venues).
4.  Call `ConstraintMapper` (Populates PIE/PEE).
5.  Generate Timetable.

## PIE & PEE Constraints Handling

The `ConstraintMapper` now handles the specific `CHM(0,1,2)` format:

1.  **PEE (Period Exclusive Exams)**: Mapped directly from `constraint_table.period_exc_e`.
2.  **PIE (Period Inclusive Exams)**: Mapped from `constraint_table.period_inc_e` and **inverted** (logic: exclude from all periods _except_ these).
3.  **Global Exclusions**: Enforced via `period_exclusion_snapshots`.

## Remaining Integration Tasks

- [ ] Implement query for `slashedc` table in `DbConfigLoader`.
- [ ] Implement query for `course` enrollment counts (already likely handled by `LoadMCData`).
- [ ] Migrate `UniWideNonExamC` logic from CSV to potentially a DB table if desired.

## Proposed Refactor Strategy

### 1. Unified Configuration Loader (`DbConfigLoader.java`)

Instead of manual variable assignments peaking at 200+ lines, we will implement a loader that:

- Connects to the database provided.
- Queries `general_settings` for `noOfWks`, `pPerDay`, `ttDaysPerWk`, `semester`, etc.
- Queries `output_tab` for `venue_alg`, `mix_exams`, `select_staff_random`, etc.
- Automatically populates the `ConfigData` (`cData`) object.

### 2. Constraint Mapping Logic (`ConstraintMapper.java`)

The core requirement is to handle "Period Inclusive Exams" (PIE).

- **Column `period_inc_e`**: If an exam has "Inclusive" periods (e.g., "1,2,3"), it means it MUST happen in those periods.
- **Inversion Logic**: To integrate with the existing `periodExclusiveExamsTMap`, we invert this. If it's inclusive of `1,2,3`, we exclude it from all other periods `4, 5, ..., maxPCount`.
- **Constraint Pull**: Fetch all active records from `constraint_table` and apply them to `enCourseL`.

### 3. Folder Structure

All new components and the refactored entry point will be placed in:
`c:\Users\Wise\Desktop\time-table\generation-logic/`

## Refactor Plan (Step-by-Step)

| Phase           | Description                                                                                            |
| :-------------- | :----------------------------------------------------------------------------------------------------- |
| **Analysis**    | Map all 50+ variables in `TimetableAppCode.txt` to `examtt3` schema columns.                           |
| **Utility Dev** | Create `DbConfigLoader` and `ConstraintMapper`.                                                        |
| **Refactor**    | Clean up `TimetableAppCode.txt` to remove hardcoded values.                                            |
| **Integration** | Replace Lines 711-736 with a single call: `ConstraintMapper.applyConstraints(cData, enCourseL, conn);` |

---

> [!NOTE]
> This refactor ensures that on the "other machine", the logic will simply "boot up" by reading the DB, requiring zero manual configuration or code edits when switching regimes.
