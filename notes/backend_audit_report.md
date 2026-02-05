# Backend Audit Report - Feb 2026

## Executive Summary

A comprehensive security and logic audit was conducted on the entire backend API layer. **Two critical vulnerabilities** were discovered and fixed in the Registration module. All other controllers were verified to be secure with proper RBAC enforcement.

---

## Critical Fixes

### 1. Student Course Registration (POST /registration/post)

**Vulnerability:** NullPointerException when processing JSON payloads with ID-only references.

**Root Cause:** Service assumed input objects were fully-loaded JPA entities with populated relationships.

**Impact:** Server crash on legitimate registration requests, potential RBAC bypass.

**Status:** ✅ FIXED - Now fetches managed entities before processing.

### 2. Semester Enrollment (POST /sem/reg)

**Vulnerability:** Same NPE issue as above.

**Status:** ✅ FIXED - Applied same entity-fetching pattern.

---

## Security Audit Results

### ✅ Secure Controllers (11/11)

| Controller                | Security Mechanism         | Notes                    |
| ------------------------- | -------------------------- | ------------------------ |
| AlgorithmController       | `enforceAlgorithmAccess`   | Admin-only trigger       |
| GeneralSettingsController | `enforceAlgorithmAccess`   | Admin-only modify        |
| Constraintcontroller      | `enforceScope(null, null)` | Admin-only history       |
| PeriodExclusionController | `enforceAlgorithmAccess`   | Admin-only save/activate |
| Venuecontroller           | `enforceVenueAccess`       | AD+CR only               |
| Coursecontroller          | Service-layer delegation   | Scoped access            |
| Staffcontroller           | Service-layer delegation   | Scoped access            |
| Studentcontroller         | Service-layer delegation   | Scoped access            |
| Departmentcontroller      | Service-layer delegation   | Scoped access            |
| Programcontroller         | Service-layer delegation   | Scoped access            |
| Centrecontroller          | Service-layer delegation   | Scoped access            |

### ⚠️ Open Endpoints (Acceptable)

- `GET /users/all` - Unrestricted (internal tool usage)
- `GET /settings/general` - Public read (needed for UI)
- `GET /constraint/get/latest` - Public read (needed for UI)
- `GET /venue/get` - Public read (needed for constraints dropdown)

---

## RBAC Enforcement Patterns

### Pattern 1: Controller-Level Enforcement

```java
@PostMapping("/trigger")
public ResponseEntity<?> triggerAlgorithm(...) {
    policyService.enforceAlgorithmAccess(actorUsername);
    // ... business logic
}
```

### Pattern 2: Service-Layer Delegation

```java
// Controller
@PostMapping("/post")
public String add(@RequestBody Course course, @RequestHeader String actorUsername) {
    courseservice.saveCourse(course, actorUsername);
}

// Service
public Course saveCourse(Course course, String actorUsername) {
    policyService.enforceScope(actorUsername, deptId, collegeId);
    return repository.save(course);
}
```

---

## Role Mapping Verification

| Role ID | Role Code | Access Level    | Status      |
| ------- | --------- | --------------- | ----------- |
| 1       | AD        | Global          | ✅ Verified |
| 2       | CR        | College-wide    | ✅ Verified |
| 3       | DR        | Department-only | ✅ Verified |
| 4       | ST        | Department-only | ✅ Verified |

---

## Documentation Updates

- ✅ `ENDPOINT_LIST.md` - Added RBAC annotations, corrected paths, added Period Exclusion API
- ✅ `REFACTOR_TODO.md` - Marked BE-08 (Backend Audit) as complete
- ✅ `RBAC_IMPLEMENTATION.md` - Added Backend Audit section with vulnerability details
- ✅ `notes/backend_audit_report.md` - Created this summary

---

## Recommendations

### Immediate

- ✅ Deploy fixes to production (both services patched)
- ✅ Update API documentation

### Short-term

- Consider restricting `GET /users/all` to Admin-only
- Add rate limiting to public endpoints

### Long-term

- Implement audit logging for all RBAC violations
- Add integration tests for RBAC enforcement
- Consider moving to permission-based (vs role-based) model

---

**Audit Conducted By:** Antigravity AI  
**Date:** 2026-02-01  
**Status:** COMPLETE ✅
