# 🧠 Timetable Logic Refactor: Adjustment Guide

This document outlines the necessary logic adjustments for the core Timetable Generation engine to align with the `schema2.sql` refactor and the new Zero-Trust backend architecture.

---

## 🏗️ 1. Theoretical Data Flow (Updated)

With the refactor, the data flow for generation must be strictly sequential to ensure integrity:

1.  **Scope Initialization**: Identify the Session and Semester (e.g., 2023/2024, Semester 2).
2.  **Active Student Resolution**: Fetch students from `student_semester_registration` for the target scope.
3.  **Exam Demand Matrix**: Join the resolved students with the `registration` table to identify which courses require exam slots and the headcount for each.
4.  **Constraint Ingestion**: Load the structured strings from `constraint_table` and parse them into a memory-resident validation graph.
5.  **Resource Mapping**: Load `venue` (prioritizing `actual_capacity`) and `staff` availability.
6.  **Slot Assignment**: Execute the optimization algorithm (Satisfiability).
7.  **Persistence**: Write results to `output_tab` (general slots) and `examtab` (metadata).

---

## ⚙️ 2. Core Logic Adjustments

### 2.1 Constraint Interpretation (The Parser)

The `constraint_table` stores constraints as delimited strings (e.g., `CHM102(0,1,2);CSC202(1,2,3)`).

- **Update**: Implement a `ConstraintParserService` using Regex (see implementation below).
- **Target**: Transform `periodIncE`, `periodExcE`, `venueIncE`, etc., into queryable `Set` or `Map` objects.

### 2.2 Venue Sizing (Headcount vs Capacity)

- **Logic**: Use `actual_capacity` from the `venue` table instead of `capacity`.
- **Headcount Calculation**: Sum registrations for each course _only_ for students with a valid entry in `student_semester_registration` for the target scope.
- **Level Snapshot**: Utilize the `level` field from `student_semester_registration` (not the student's current level) to apply level-specific constraints (e.g., "100L exams must be in the morning").

### 2.3 Staff Distribution (Invigilation)

- **Logic**: Order staff by `duty_count` (ASC) and `serial_no` to ensure fair distribution during automated assignment.

---

## 🛠️ 3. Implementation Patterns (Code Recommendations)

### 3.1 The Constraint Parser Service

Use a regex-based approach to convert DB strings into logic-ready objects.

```java
@Service
public class ConstraintParserService {
    // Input: "CHM101(0,1);PHY102(4,5)"
    // Output: Map of Course Code -> List of Periods
    public Map<String, List<Integer>> parsePeriodConstraints(String raw) {
        Map<String, List<Integer>> map = new HashMap<>();
        if (raw == null || raw.isEmpty()) return map;

        Pattern pattern = Pattern.compile("([A-Z0-9]+)\\((.*?)\\)");
        Matcher matcher = pattern.matcher(raw);

        while (matcher.find()) {
            String course = matcher.group(1);
            List<Integer> periods = Arrays.stream(matcher.group(2).split(","))
                .map(String::trim)
                .map(Integer::parseInt)
                .collect(Collectors.toList());
            map.put(course, periods);
        }
        return map;
    }
}
```

### 3.2 Resolving the Conflict Matrix (Enrollment-First)

To strictly follow the **Enrollment-First** principle, the conflict matrix should be derived from students who are officially enrolled for the semester.

```java
@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    @Query("SELECT r1.course.code, r2.course.code, COUNT(r1.student.id) " +
           "FROM Registration r1 " +
           "JOIN Registration r2 ON r1.student.id = r2.student.id " +
           "JOIN StudentSemesterRegistration ssr ON r1.student.id = ssr.student.id " +
           "WHERE r1.course.id < r2.course.id " +
           "AND r1.session = :session AND r1.semester = :sem " +
           "AND ssr.session = :session AND ssr.semester = :sem " +
           "GROUP BY r1.course.code, r2.course.code")
    List<Object[]> findStudentConflicts(String session, Integer sem);
}
```

_Note_: The join with `StudentSemesterRegistration` (ssr) ensures that only registrations for "academically active" students are counted, even if orphaned registration rows exist.

### 3.3 The Generation Loop (SAT Solver Pattern)

The core logic should poll the `OptimizationSettings` for parameters and report progress.

```java
@Transactional
public void generateTimetable(String session, Integer sem) {
    // 1. Load state & Optimization Config
    OptimizationSettings settings = optRepo.findById(1L).get();
    List<Venue> activeVenues = venueRepo.findByInUseTrue();

    // 2. Initialize Progress
    settings.setDisplayProgress(5);
    optRepo.save(settings);

    // 3. Execution Logic
    for (int cycle = 0; cycle < settings.getOptCycleCount(); cycle++) {
        // Logic: Try assigning Course C to Slot S in Venue V
        // Rule 1: Slot S is not in EXCLUDED_PERIODS(C)
        // Rule 2: sharedStudents(C, OthersInSlotS) == 0
        // Rule 3: count(StudentsInC) <= V.getActualCapacity()

        // 4. Async Progress Updates
        if (cycle % 10 == 0) {
            int progress = 5 + (int)((cycle / (double)settings.getOptCycleCount()) * 95);
            updateProgressInDB(progress);
        }
    }
}
```

---

## � 4. Migration Blueprint (Transitioning Legacy Logic)

To migrate the core generation engine from the legacy structure to the refactored architecture, follow these specific steps:

### Phase A: Identity & Relationship Mapping

- **Action**: Replace all `String matricNo` and `String courseCode` references in the algorithm with `Integer studentId` and `Integer courseId`.
- **Rationale**: The new schema uses numeric PK/FK for all joins to improve performance and data integrity.

### Phase B: Query Modernization (The Data Source)

- **Legacy Source**: `SELECT * FROM registration` (Inferred existence).
- **Refactored Source**: Join `student_semester_registration` (SSR) with `registration` (REG).
- **Migration Code**:
  ```java
  // Use this to resolve the "True Demand" for the semester
  @Query("SELECT r.course FROM Registration r " +
         "JOIN StudentSemesterRegistration ssr ON r.student.id = ssr.student.id " +
         "WHERE ssr.session = :session AND ssr.semester = :sem")
  List<Course> findCoursesRequiringExams(@Param("session") String s, @Param("sem") Integer sm);
  ```

### Phase C: Constraint Adapter Layer

- **Action**: Do NOT refactor the algorithm's internal constraint checking logic yet. Instead, write an **Adapter** (the `ConstraintParserService`) that feeds the old logic with the new data.
- **Goal**: Keep the core SAT/Backtracking logic intact while updating where it gets its "No-Go" lists.

### Phase D: Service Decoupling

- **Action**: Isolate the generation trigger.
- **Implementation**:
  - Create `TimetableGenerationService`.
  - The Controller should only call `.startGeneration(session, semester)`.
  - All DB lookups for venues, constraints, and students must happen _inside_ the Service via Repositories.

---

## �🚀 5. Logic Hardening Checklist

1.  **[ ] Zero-Conflict Validation**: The algorithm must verify `sharedStudents == 0` for all courses in a single slot using the enrollment-scoped conflict matrix.
2.  **[ ] Actual Capacity Scaling**: Ensure `actual_capacity` is used to allow for "spaced" exam seating (Safety Factor: 1.0).
3.  **[ ] Level-Aware Scheduling**: Use the enrollment `level` snapshot to resolve level-specific period constraints.
4.  **[ ] Transactional Integrity**: The entire generation write-back to `output_tab` should be wrapped in a single `@Transactional` block.
5.  **[ ] Performance Audit**: Ensure indexes exist on `registration(session, semester)` and `student_semester_registration(session, semester)`.

---

**Status**: _Detailed Migration Guide & Implementation Patterns Ready._
