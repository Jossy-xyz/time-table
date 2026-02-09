# Walkthrough: Generation Logic Migration (Phase 1)

I have successfully completed the first phase of migrating the timetable generation logic from manual configuration to a database-driven system.

## Accomplishments

### 1. Technical Analysis

- Mapped all hardcoded variables in `TimetableAppCode.txt` to the `examtt3` database schema.
- Identified critical constraints (PIE/PEE) and timing logic that required dynamic loading.

### 2. Logic Machine Utilities

I created a bridge folder `generation-logic/` containing:

- **[ConstraintMapper.java](file:///c:/Users/Wise/Desktop/time-table/generation-logic/ConstraintMapper.java)**: Handles the special `CHM(0,1,2)` format and inverts "Inclusive" constraints into the "Exclusive" mapping required by the solver.
- **[DbConfigLoader.java](file:///c:/Users/Wise/Desktop/time-table/generation-logic/DbConfigLoader.java)**: Contains the SQL logic to populate the `ConfigData` object from various settings tables.

### 3. Integration Protection

- **[REFACTOR_DIRECTIVE.md](file:///C:/Users/Wise/.gemini/antigravity/brain/7d21f4b3-c006-4eda-a2ef-df46a1c700fc/REFACTOR_DIRECTIVE.md)**: Created a clear set of instructions for the logic machine refactor, specifically mandating the **preservation of all existing comments**.

## Next Steps (Phase 2)

The system is now ready for deployment on your logic machine.

1.  **Copy** the `generation-logic` folder.
2.  **Apply** the directives in `REFACTOR_DIRECTIVE.md`.
3.  **Validate** the connection and data pull.

---

> [!TIP]
> Once the basic migration is verified, we can move to **Phase 3**: automating the "Selective Exams" and "Non-Exam Courses" which are still currently hardcoded or CSV-based.
