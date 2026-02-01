# Bells University Timetable Generator - Constraints Section Refactor Plan

This plan details the implementation strategy for the **Institutional Constraints Section**, ensuring tight integration between the React frontend and the Spring Boot backend while maintaining the "Raw String" storage policy.

## 1. Backend Architecture (Persistence & Validation)
**Objective:** Align the JPA model with `schema2.sql` and implement robust string validation.

### 1.1 Model Refactor
*   Update `Constrainttable.java` to include all specific constraint fields:
    *   `periodIncE`, `periodExcE`, `venueIncE`, `venueExcE` (Exam-based)
    *   `periodIncV`, `periodExcV` (Venue-based)
    *   `examWAftE`, `examExcE`, `frontLE` (Sequence/Policy-based)
*   Add `@Temporal(TemporalType.TIMESTAMP)` to the `date` field for auditing.

### 1.2 Constraint Validation Service
*   **Parser Logic:** Implement a regex-based parser to validate the format `CODE(val1,val2,...)`.
*   **Entity Verification:** 
    *   Cross-reference `courseCode` in strings against the `Course` table.
    *   Cross-reference `venueCode` in strings against the `Venue` table.
*   **Range Checks:** Ensure period numbers (e.g., 0-9) are within the university's valid scheduling slots.

## 2. Frontend Architecture (UI/UX)
**Objective:** Provide a seamless, error-proof interface for complex constraint entry.

### 2.1 Component Enhancements
*   **InstitutionalConstraintsSection:** 
    *   Ensure all `CONSTRAINT_GROUPS` keys map exactly to backend entity fields.
    *   Implement "Click-to-Edit" on existing chips to re-open selectors.
*   **InputChip Integration:** 
    *   Enhance the search filter behavior to allow quick selection of courses/venues.
    *   Add validation styling (e.g., red border if a code is manually typed but invalid).
*   **Selectors:**
    *   `PeriodSlotSelector`: Multi-select grid for time slots.
    *   `VenueSlotSelector`: Searchable list for venue selection.

## 3. Implementation Roadmap (To-Do List)

### Step 1: Backend Model & Repository
- [ ] Refactor `com.example.springproject.model.Constrainttable` to match `schema2.sql`.
- [ ] Update `Cosntrainttablerepo` to support the new field structure.
- [ ] Add a `getLastUpdatedConstraint()` method to fetch the most recent config.

### Step 2: Backend Validation Logic
- [ ] Create `ConstraintValidatorUtils` to handle string parsing.
- [ ] Implement `@PrePersist` or Service-layer validation to reject malformed delimited strings.

### Step 3: Frontend Component Sync
- [ ] Update `InstitutionalConstraintsSection.tsx` to use the new backend field names.
- [ ] Implement the `onSaveAll` service call using `Axios` or `fetch`.

### Step 4: End-to-End Integration
- [ ] Verify that saving from UI updates the database correctly.
- [ ] Verify that refreshing the page correctly parses the strings back into UI chips.

## 4. Constraint String Format Reference
| Field | Format Example | Description |
| :--- | :--- | :--- |
| `periodIncE` | `CHM101(0,1,2);MTH101(3)` | Exam must be in these periods. |
| `venueIncE` | `COS202(HALL1);PHY101(LAB2)` | Exam must be in these venues. |
| `periodIncV` | `HALL1(1,2);LAB1(4,5)` | Venue available only in these periods. |
| `examWAftE` | `MTH101,PHY101;CHM101,COS101` | Semicolon-separated sequences. |
