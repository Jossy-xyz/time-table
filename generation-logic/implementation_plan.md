# Implementation Plan: Database-Driven Generation Logic

## Current Status: PHASE 1 COMPLETED

- [x] Context analysis of `TimetableAppCode.txt`.

4.  Call `ConstraintMapper` (Populates PIE/PEE).
5.  Generate Timetable.

## Institutional Context (The "Active Triad")

The refactor now supports a **Precise Selection Model**. Instead of relying on the newest record, the utilities accept explicit IDs to lock the context:

1. **General Settings (GS)**: Pulls session/timing based on unique ID.
2. **Exclusion Snapshot**: Pulls the specific calendar mask applied during that session.
3. **Constraint Set**: Pulls the exact exam-specific rules (PIE/PEE) associated with the run.

This ensures **Audit Integrity**—you can always re-run a historic timetable with the exact same logical constraints even if the database settings have since changed.

- [x] Creation of `ConstraintMapper.java` (PIE/PEE mapping & inversion).
- [x] Creation of `DbConfigLoader.java` (SQL mappings for all solver/institutional settings).
- [x] Creation of `REFACTOR_DIRECTIVE.md` (Integration manual with comment preservation rules).

## Phase 2: Integration (Interactive Guidance)

The next step is to use the `REFACTOR_DIRECTIVE.md` to guide the integration on the logic machine.

### [NEW] `generation-logic/` Folder

Contains the logic bridge between the database and the existing generator.

- [DbConfigLoader.java](file:///c:/Users/Wise/Desktop/time-table/generation-logic/DbConfigLoader.java): Orchestrates the loading of session, timing, and solver parameters. Supports specific ID-based fetching for "Active Selection" context.
- [ConstraintMapper.java](file:///c:/Users/Wise/Desktop/time-table/generation-logic/ConstraintMapper.java): Handles the conversion of string-based constraints (PIE/PEE) into the `periodExclusiveExamsTMap`. Integrates global exclusion snapshots by ID.

### Integration Rules

> [!IMPORTANT]
> **Comment Integrity**: Absolutely NO comments should be removed from the original logic file.
> **Sequential Pulls**: The DB configuration pull must happen3. **Validate** the connection and data pull.

---

### Phase 1B: Precise Control & Diagnostics

- **ID-Based Loading**: Added support for passing explicit Version IDs to pull the "Active Triad" of configurations (GS, Constraints, Exclusions).
- **Debug Instrumentation**: Embedded `[DEBUG]` logging for real-time verification of database pulls and constraint application.
- **Robust Merging**: Implemented conflict resolution for overlapping PIE/PEE constraints.

---

## Technical Outcomes

immediately after connection establishment to ensure all variables are populated before solver initialization.

## Phase 3: Verification & Recommendations

- [ ] Verify `maxPCount` is correctly calculated from DB-pulled `pPerDay` and `noOfWks`.
- [ ] Implement Recommendation: Move "Selective Exams" from hardcoded logic to `selective_exams_config` table.
- [ ] Implement Recommendation: Move "Non-Exam Courses" from CSV to `non_exam_courses` table.

## Final Walkthrough

A `walkthrough.md` will be provided once the user confirms successful file transfer to the logic machine.
