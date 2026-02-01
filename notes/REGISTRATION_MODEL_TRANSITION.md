# **Registration & Timetable Refactor Proposal**

**Purpose:** Explain the transition from the legacy `registration` table to a **two-layer enrollment + course registration model**, justify the change with real use cases, and outline how to adapt the timetable generator **without major refactor or logic breaks**.

---

## 1. Background: Legacy Model

### Legacy Table

```sql
CREATE TABLE registration (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  centre_id INT NOT NULL,
  regDMC INT NOT NULL,
  matricno VARCHAR(50) NOT NULL,
  course_code VARCHAR(20) NOT NULL,
  session VARCHAR(20) NOT NULL,
  semester INT NOT NULL,
  UNIQUE(matricno, course_code, session),
  FOREIGN KEY (matricno) REFERENCES student(matric_no),
  FOREIGN KEY (course_code) REFERENCES course(code),
  FOREIGN KEY (centre_id) REFERENCES centre(id)
);
```

### Problems

1. **Academic ambiguity**: Student must have a course to exist academically.
2. **Overloaded responsibility**: Identity, course load, and organizational scope mixed.
3. **Fragile joins**: Uses string keys (`matricno`, `course_code`).
4. **Centre redundancy**: Derivable from program → department → centre.
5. **Opaque regDMC field**: No defined business purpose.

---

## 2. Refactored Model Overview

### 2.1 Student Semester Registration

```sql
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
```

**Represents:**

> “This student is academically active in a given session and semester.”

* Tracks level (100, 200, …)
* Provides **deterministic scope** for timetable generation

---

### 2.2 Course Registration

```sql
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
    REFERENCES student_semester_registration(student_id, session, semester)
    ON DELETE CASCADE,
  UNIQUE(student_id, course_id, session)
);
```

**Represents:**

* This enrolled student is taking this specific course in this semester.
* Anchored to semester enrollment to avoid orphaned registrations
* Supports add/drop without affecting enrollment
* Enables deterministic course-level timetables

---

## 3. Why This Separation Matters

### Academic Reality Mapping

| Concern                        | Table                           |
| ------------------------------ | ------------------------------- |
| Student exists in semester     | `student_semester_registration` |
| Student takes specific courses | `registration`                  |

**Timetable generator flow:**

```
Step 1: Resolve active students → student_semester_registration
Step 2: Resolve their course registrations → registration
Step 3: Aggregate exams → exam scheduling
Step 4: Apply constraints → constraint_table parsing
```

* Legacy table collapsed step 1 & 2 → unpredictable results
* Refactored model separates concerns → predictable outputs

---

## 4. Use Case Validation

### UC1: Student enrolled but no courses yet

* Legacy: invisible to generator
* Refactored: valid, zero-course student; safe scheduling

### UC2: Add/drop courses

* Legacy: requires deleting and reinserting; fragile
* Refactored: only modifies `registration`; enrollment unchanged

### UC3: Withdrawal from semester

* Legacy: multiple rows affected manually; risky
* Refactored: delete enrollment row; cascade deletes registrations automatically

### UC4: Timetable generation scope

* Legacy: must infer who exists → fragile
* Refactored: use enrollment first → deterministic course list

### UC5: Level-based exam constraints

* Legacy: level inferred dynamically → potential mismatch
* Refactored: `level` snapshot per semester allows accurate constraint filtering

### UC6: Repeat generation / rollback

* Legacy: input may have changed silently → non-reproducible
* Refactored: enrollment stable → same input, same output

### UC7: Validation before generation

* Legacy: complex joins; error-prone
* Refactored: simple rule → registrations only allowed for enrolled students

---

## 5. Adapting Timetable Logic Without Breaking

1. **Preserve legacy queries**

   ```sql
   SELECT matricno, course_code FROM registration WHERE session=? AND semester=?
   ```

   * Can continue to work initially
   * Use a **compatibility view** if necessary:

   ```sql
   CREATE VIEW legacy_registration_view AS
   SELECT r.id, s.matric_no AS matricno, c.code AS course_code, r.session, r.semester
   FROM registration r
   JOIN student s ON r.student_id = s.id
   JOIN course c ON r.course_id = c.id;
   ```

2. **Add pre-generation validation**

   * Filter out students without enrollment:

   ```sql
   SELECT student_id FROM student_semester_registration WHERE session=? AND semester=?
   ```

3. **Derive centre, department, program**

   * Instead of storing in registration, resolve dynamically:

   ```
   student -> program -> department -> centre
   course  -> department -> centre
   ```

4. **Constraint parsing**

   * Keep `constraint_table` as VARCHAR strings (CHM(0,1,2);ITP401(1,2))
   * Backend parses dynamically; no normalization needed

5. **No major algorithm rewrite**

   * Only **filter and validate registration rows** against enrollment first
   * Timetable generator consumes exactly the same rows as before, now safer


## Use-Case Validation for the Enrollment + Registration Model

### Purpose
This section documents real operational use cases that justify separating:
- `student_semester_registration` (academic existence)
- `registration` (course-level enrollment)

Each use case demonstrates:
- Why the legacy model fails or becomes fragile.
- How the refactored model handles the scenario cleanly.
- Why timetable generation becomes safer and more deterministic.

### Use Case 1: Student Enrolled but Yet to Register Courses
**Scenario**: A student has completed school fee payment and semester enrollment but has not yet registered any courses.

- **Legacy Model Outcome**: Student does not exist in the system, cannot be counted or validated, and is invisible to downstream logic.
- **Refactored Model Outcome**: `student_semester_registration` row exists; student is academically active. Zero course registrations is a valid state.
- **Impact on Timetable**: Student is not scheduled for any exams (correct). System remains consistent with no phantom assumptions.
- **Verdict**: Legacy model cannot represent this reality. Refactored model can.

### Use Case 2: Course Add / Drop Window
**Scenario**: A student registers 6 courses, drops 1, and adds another within the allowed period.

- **Legacy Model Outcome**: Deletes and reinserts rows. No clear distinction between enrollment state and course load. High risk of accidental deletion affecting semester participation.
- **Refactored Model Outcome**: Enrollment row remains unchanged; only registration rows are modified. Provides a clean audit trail.
- **Impact on Timetable**: Generator simply sees updated course list. No enrollment ambiguity or orphan states.
- **Verdict**: Refactored model supports real academic workflows cleanly.

### Use Case 3: Student Withdraws from Semester
**Scenario**: A student formally withdraws from the semester.

- **Legacy Model Outcome**: Requires deleting all course registrations. No single authoritative action; partial deletions cause silent corruption.
- **Refactored Model Outcome**: Delete one row from `student_semester_registration`. Cascade removes all course registrations. System state becomes consistent immediately.
- **Impact on Timetable**: Student is excluded entirely. No dangling course registrations; exam counts update correctly.
- **Verdict**: Refactored model enables atomic academic decisions.

### Use Case 4: Timetable Generation Scope Control
**Scenario**: Generate timetable for Session 2024/2025, Semester 1.

- **Legacy Model Requirement**: Infer who is active from course registrations. Risk including late registrations, invalid data, or orphan rows.
- **Refactored Model Requirement**: Explicitly select enrolled students first, then resolve course load.
- **Generator Flow (Refactored)**:
  1. Resolve enrolled students
  2. Resolve registered courses
  3. Aggregate exams
  4. Apply constraints
- **Impact**: Deterministic input set, predictable exam counts, and reproducible outputs.
- **Verdict**: Timetable generation becomes a controlled pipeline, not a guess.

### Use Case 5: Level-Based Exam Constraints
**Scenario**: Some exams apply only to 100-level or 400-level students.

- **Legacy Model Outcome**: Level must be inferred dynamically. Risk of mismatch; requires complex joins and assumptions.
- **Refactored Model Outcome**: Level snapshot stored in `student_semester_registration`. Level is semester-specific and reliable.
- **Impact on Timetable**: Level-based constraints become trivial with no guesswork or runtime surprises.
- **Verdict**: The refactored model enables accurate constraint enforcement.

### Use Case 6: Repeat Timetable Generation (Rollback / Re-run)
**Scenario**: Timetable needs to be regenerated due to constraint changes, venue issues, or corrections.

- **Legacy Model Outcome**: Input set may have changed silently; hard to reproduce previous state.
- **Refactored Model Outcome**: Enrollment snapshot remains stable. Course registrations are explicit. Same inputs lead to same outputs.
- **Impact**: Deterministic regeneration, audit-friendly, and high confidence in output correctness.
- **Verdict**: Refactored model supports repeatable computation.

### Use Case 7: Data Validation Before Generation
**Scenario**: System must validate no ghost students or invalid semester participation.

- **Legacy Model Outcome**: Validation requires complex queries; high risk of missing edge cases.
- **Refactored Model Outcome**: Simple rule: If no enrollment row exists, reject registration.
- **Impact**: Fewer bugs, clear error messages, and strong backend discipline.
- **Verdict**: Validation becomes enforceable, not heuristic.

### Use Case 8: Minimal-Change Transition Strategy
**Scenario**: System already exists and must not break during refactoring.

- **Refactored Model Support**: Legacy-compatible views and backend pre-filters. No immediate algorithm rewrite required.
- **Impact**: Safe migration, no downtime, and no logic regression.
- **Verdict**: This model respects operational reality.

### Final Synthesis

#### What the Legacy Model Assumed
- Course registration implies enrollment.
- Absence of data implies absence of student.
- Timetable scope can be inferred.

#### What the Refactored Model Guarantees
- Enrollment is explicit.
- Course load is independent.
- Timetable inputs are deterministic.

### One-Paragraph Justification (For Reviewers)
The separation of semester enrollment from course registration reflects real academic workflows and enables deterministic timetable generation. It eliminates ambiguous states, improves validation, supports add/drop and withdrawal scenarios, and allows backward-compatible migration without breaking existing logic.
