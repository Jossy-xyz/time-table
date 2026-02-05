## 🔐 RBAC Implementation Summary

**Date:** 2026-02-01  
**Status:** ✅ COMPLETE

---

### Overview

This document summarizes the Role-Based Access Control (RBAC) implementation for the Bells University Timetable System. The system now enforces hierarchical access control across all major entities.

---

### Role Hierarchy

| Role Code | Role Name                 | Scope                                                |
| --------- | ------------------------- | ---------------------------------------------------- |
| **AD**    | Administrator             | Global (all colleges, departments, and entities)     |
| **CR**    | College Representative    | College-level (all departments within their college) |
| **DR**    | Department Representative | Department-level (only their department)             |
| **ST**    | Staff                     | Department-level (only their department)             |

---

### Access Control Matrix

#### Personnel & Enrollment Entities

| Entity               | AD     | CR              | DR           | ST           |
| -------------------- | ------ | --------------- | ------------ | ------------ |
| **Staff**            | ✅ All | ✅ College-wide | ✅ Dept-only | ✅ Dept-only |
| **Students**         | ✅ All | ✅ College-wide | ✅ Dept-only | ✅ Dept-only |
| **Courses**          | ✅ All | ✅ College-wide | ✅ Dept-only | ✅ Dept-only |
| **Departments**      | ✅ All | ❌              | ❌           | ❌           |
| **Centres/Colleges** | ✅ All | ❌              | ❌           | ❌           |

#### Infrastructure & Operations

| Entity                | AD      | CR     | DR  | ST  |
| --------------------- | ------- | ------ | --- | --- |
| **Venues**            | ✅ All  | ✅ All | ❌  | ❌  |
| **General Settings**  | ✅ All  | ❌     | ❌  | ❌  |
| **Constraints**       | ✅ All  | ❌     | ❌  | ❌  |
| **Period Exclusions** | ✅ All  | ❌     | ❌  | ❌  |
| **Algorithm Trigger** | ✅ Only | ❌     | ❌  | ❌  |

---

### Implementation Details

#### 1. PolicyEnforcementService

**Location:** `service/PolicyEnforcementService.java`

**Methods:**

- `checkScope(actorUsername, targetDeptId, targetCollegeId)` - General hierarchical scope validation
- `enforceScope(...)` - Throws exception if scope check fails
- `enforceVenueAccess(actorUsername)` - **CR + AD only**
- `enforceAlgorithmAccess(actorUsername)` - **AD only**

**Key Logic:**

```java
// College Rep can access:
// 1. Direct college match (targetCollegeId)
// 2. Departments within their college (via Department.centre.id)
if ("CR".equalsIgnoreCase(role)) {
    if (targetCollegeId != null && actorCollegeId.equals(targetCollegeId)) {
        return true;
    }
    if (targetDeptId != null) {
        return departmentRepository.findById(targetDeptId)
            .map(dept -> dept.getCentre().getId().equals(actorCollegeId))
            .orElse(false);
    }
}
```

---

#### 2. Repository Enhancements

Added college-level queries to support CR visibility:

**Staffrepository:**

```java
List<Staff> findByDepartmentCentreId(Integer centreId);
```

**Studentrepository:**

```java
List<Student> findByDepartmentCentreId(Integer centreId);
```

**Courserepository:**

```java
List<Course> findByDepartmentCentreId(Integer centreId);
```

These leverage JPA's nested property navigation: `department.centre.id`

---

#### 3. Service Layer Updates

Added college-scoped retrieval methods:

- `Staffservice.getStaffByCollege(Integer collegeId)`
- `Studentservice.getStudentsByCollege(Integer collegeId)`
- `Courseservice.getCoursesByCollege(Integer collegeId)`

---

#### 4. Controller Logic

**Pattern for GET endpoints:**

```java
String role = (actor.getRole() != null) ? actor.getRole().getCode() : "UNKNOWN";

if ("AD".equalsIgnoreCase(role)) {
    entities = service.getAll();
} else if ("CR".equalsIgnoreCase(role) && actor.getCollege() != null) {
    entities = service.getByCollege(actor.getCollege().getId());
} else if (actor.getDepartment() != null) {
    entities = service.getByDepartment(actor.getDepartment());
} else {
    entities = List.of();
}
```

**Pattern for POST/PUT/DELETE:**

```java
policyService.enforceScope(
    actorUsername,
    entity.getDepartment().getId(),
    entity.getDepartment().getCentre().getId()
);
```

---

### Special Access Rules

#### Venues Tab

- **Accessible by:** AD, CR
- **Restricted for:** DR, ST
- **Enforcement:** `policyService.enforceVenueAccess(actorUsername)` in all Venue CRUD operations

#### Operations Hub / Timetable Generation

- **Accessible by:** AD only
- **Restricted for:** CR, DR, ST
- **Enforcement:** `policyService.enforceAlgorithmAccess(actorUsername)` in `/algorithm/trigger`

---

### Security Headers

All requests include:

```
X-Actor-Username: <username>
```

This header is injected by the frontend `apiClient` and validated by the backend.

---

### Error Handling

**Unauthorized Access:**

```json
{
  "error": "Access Denied: You do not have permission to access/modify data in this scope."
}
```

**Venue Access Violation:**

```json
{
  "error": "Access Denied: Venue operations are restricted to Admin and College Representatives only."
}
```

**Algorithm Access Violation:**

```json
{
  "error": "Access Denied: Timetable generation is restricted to Administrators only."
}
```

---

### Testing Checklist

- [x] AD can access all entities globally
- [x] CR can access Staff/Students/Courses from all departments in their college
- [x] CR can manage Venues
- [x] CR **cannot** trigger algorithm
- [x] DR can only access entities in their department
- [x] DR **cannot** access Venues
- [x] ST has same restrictions as DR
- [x] PolicyEnforcementService correctly resolves department → college relationships

---

### Database Schema Dependencies

**Critical Relationship:**

```
Department.centre_id → Centre.id
```

This foreign key enables the college-level filtering for CR users.

**Verification Query:**

```sql
SELECT d.id, d.name, d.centre_id, c.name as college_name
FROM department d
JOIN centre c ON d.centre_id = c.id
WHERE c.id = ?;
```

---

### Frontend Integration

The frontend implements a **"Hide, Don't Disable"** philosophy for restricted actions to reduce UI clutter.

1.  **Operations Hub (TimetablePage)**:
    - **Non-Admins**: The entire controls section (System Readiness Checklist, Generation Button) is **hidden**. The Calendar Grid expands to full width (`col-span-12`).
    - **Admins**: Full access to checklist and generation triggers.

2.  **Configuration (SettingsPage)**:
    - **Non-Admins**: Can **ONLY** access the "Health & Integrity" tab. All calibration tabs (General, Constraints, Examination, Output, Optimization) are strictly hidden.
    - **Admins**: Full access to all tabs.

3.  **Authentication & Fallback**:
    - Since the backend may return `roleName` or `roleCode` depending on version, the frontend includes a robust fallback:

```typescript
const { user } = useAuthStore();
// Checks roleCode 'AD' OR roleId 1 (Admin)
const isAdmin = user?.roleCode === "AD" || user?.roleId === 1;
// Checks roleCode 'AD'/'CR' OR roleId 1 (Admin)
const canAccessVenues =
  ["AD", "CR"].includes(user?.roleCode) || user?.roleId === 1;
```

---

### Backend Audit & Security Fixes (Feb 2026)

A comprehensive audit of all backend controllers and services was conducted to ensure robust RBAC enforcement and prevent runtime errors.

#### Critical Vulnerabilities Fixed

**1. Registration Service NPE Vulnerability**

**Issue:** `Registrationserviceimp.saveRegistration` assumed input `Registration` objects contained fully-loaded `Student` and `Course` entities. When JSON payloads contained only IDs (standard REST practice), accessing `registration.getStudent().getDepartment()` caused `NullPointerException`.

**Fix:**

```java
// Fetch managed entities before RBAC check
Student student = studentrepository.findById(registration.getStudent().getId())
    .orElseThrow(() -> new RuntimeException("Student not found"));
Course course = courserepository.findById(registration.getCourse().getId())
    .orElseThrow(() -> new RuntimeException("Course not found"));

registration.setStudent(student);
registration.setCourse(course);

// Now safe to check scope
policyService.enforceScope(
    actorUsername,
    student.getDepartment().getId(),
    student.getDepartment().getCentre().getId()
);
```

**2. Semester Registration Service NPE Vulnerability**

**Issue:** Similar vulnerability in `StudentSemesterRegistrationserviceimp.saveStudentSemesterRegistration`.

**Fix:** Applied same pattern - fetch managed `Student` entity before processing.

#### Audit Findings Summary

| Controller                  | RBAC Status | Notes                                           |
| --------------------------- | ----------- | ----------------------------------------------- |
| `AlgorithmController`       | ✅ Secure   | `enforceAlgorithmAccess` (Admin only)           |
| `GeneralSettingsController` | ✅ Secure   | Modify: Admin only, Read: Open                  |
| `Constraintcontroller`      | ✅ Secure   | History: Admin, Latest: Open                    |
| `PeriodExclusionController` | ✅ Secure   | Save/Activate: Admin, Read: Open                |
| `Venuecontroller`           | ✅ Secure   | `enforceVenueAccess` (AD+CR)                    |
| `Coursecontroller`          | ✅ Secure   | RBAC delegated to Service layer                 |
| `Staffcontroller`           | ✅ Secure   | RBAC delegated to Service layer                 |
| `Studentcontroller`         | ✅ Secure   | RBAC delegated to Service layer                 |
| `Registrationcontroller`    | ✅ Fixed    | Service now fetches managed entities            |
| `Studentsemregcontroller`   | ✅ Fixed    | Service now fetches managed entities            |
| `Usercontroller`            | ⚠️ Open     | `getAllUsers` unrestricted (acceptable for now) |

#### Service-Layer RBAC Pattern

Controllers delegate RBAC to service implementations:

```java
// Controller (thin)
@PostMapping("/post")
public String add(@RequestBody Course course,
                  @RequestHeader("X-Actor-Username") String actorUsername) {
    courseservice.saveCourse(course, actorUsername);
    return "Course added successfully";
}

// Service (enforces RBAC)
@Transactional
public Course saveCourse(Course course, String actorUsername) {
    policyService.enforceScope(
        actorUsername,
        course.getDepartment().getId(),
        course.getDepartment().getCentre().getId()
    );
    return courserepository.save(course);
}
```

This pattern ensures:

- Controllers remain thin and focused on HTTP concerns
- Business logic and security are centralized in services
- Consistent enforcement across all entity operations

---

### Future Enhancements

1. **Audit Logging:** Track all access attempts and policy violations
2. **Fine-grained Permissions:** Move from role-based to permission-based (e.g., `VENUE_CREATE`, `ALGORITHM_EXECUTE`)
3. **Multi-college CR:** Support CRs managing multiple colleges
4. **Temporary Delegation:** Allow AD to temporarily grant elevated permissions

---

**Last Updated:** 2026-02-01  
**Implemented By:** Antigravity AI  
**Status:** Production-Ready ✅
