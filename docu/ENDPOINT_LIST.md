# 📡 API Endpoint Reference

Base URL: `http://localhost:8080`

> **Security Note**: All endpoints require `X-Actor-Username` header. Access is controlled via Role-Based Access Control (RBAC). See [RBAC_IMPLEMENTATION.md](docs/RBAC_IMPLEMENTATION.md) for details.

---

## 👤 User & Authentication

| Method | Endpoint            | Description                                              | RBAC   |
| ------ | ------------------- | -------------------------------------------------------- | ------ |
| POST   | `/users/login`      | Authenticate user credentials and retrieve token/details | Public |
| POST   | `/users/register`   | Register a new user (Raw Entity Payload)                 | Public |
| GET    | `/users/all`        | List all registered users                                | Open   |
| GET    | `/users/{username}` | Get user details by username                             | Open   |

---

## 🏫 Institutional Management

| Method | Endpoint               | Description               | RBAC   |
| ------ | ---------------------- | ------------------------- | ------ |
| GET    | `/centre/get`          | List all Centres/Colleges | Scoped |
| POST   | `/centre/add`          | Add a new Centre          | Scoped |
| GET    | `/department/get`      | List all Departments      | Scoped |
| POST   | `/department/add`      | Add a new Department      | Scoped |
| GET    | `/program/get`         | List all Programs         | Scoped |
| POST   | `/program/add`         | Add a new Program         | Scoped |
| GET    | `/venue/get`           | List all Venues           | Open   |
| POST   | `/venue/post`          | Add a new Venue           | AD+CR  |
| PUT    | `/venue/update/{id}`   | Update Venue              | AD+CR  |
| DELETE | `/venue/delete/{id}`   | Delete Venue              | AD+CR  |
| GET    | `/staff/get`           | List all Staff members    | Scoped |
| POST   | `/staff/post`          | Add a new Staff member    | Scoped |
| PUT    | `/staff/update/{id}`   | Update Staff              | Scoped |
| DELETE | `/staff/delete/{id}`   | Delete Staff              | Scoped |
| GET    | `/student/get`         | List all Students         | Scoped |
| POST   | `/student/post`        | Add a new Student         | Scoped |
| PUT    | `/student/update/{id}` | Update Student            | Scoped |
| DELETE | `/student/delete/{id}` | Delete Student            | Scoped |

---

## 📚 Academic Registration

| Method | Endpoint                    | Description                             | RBAC   | Notes                                         |
| ------ | --------------------------- | --------------------------------------- | ------ | --------------------------------------------- |
| GET    | `/course/get`               | List all Courses                        | Scoped | Returns courses based on user's scope         |
| POST   | `/course/done`              | Add a new Course                        | Scoped | Enforced at Service layer                     |
| PUT    | `/course/update/{id}`       | Update Course                           | Scoped | Enforced at Service layer                     |
| DELETE | `/course/delete/{id}`       | Delete Course                           | Scoped | Enforced at Service layer                     |
| GET    | `/sem/get`                  | List all Student Semester Registrations | Open   |                                               |
| POST   | `/sem/reg`                  | Register a Student for a Semester       | Scoped | **Fixed**: Now fetches managed Student entity |
| PUT    | `/sem/update/{id}`          | Update Semester Registration            | Scoped |                                               |
| DELETE | `/sem/delete/{id}`          | Delete Semester Registration            | Scoped |                                               |
| GET    | `/registration/get`         | List all Course Enrollments             | Open   |                                               |
| POST   | `/registration/post`        | Enroll Student in a Course              | Scoped | **Fixed**: Now fetches managed Student/Course |
| PUT    | `/registration/update/{id}` | Update Course Registration              | Scoped |                                               |
| DELETE | `/registration/delete/{id}` | Delete Course Registration              | Scoped |                                               |

---

## ⚙️ Configuration & Settings

| Method | Endpoint                    | Description                                       | RBAC  |
| ------ | --------------------------- | ------------------------------------------------- | ----- |
| GET    | `/settings/general`         | Get Global Schedule Settings (Session, Sem, Grid) | Open  |
| POST   | `/settings/general`         | Update Global Schedule Settings                   | Admin |
| GET    | `/settings/general/history` | Get General Settings History                      | Open  |
| GET    | `/constraint/get/latest`    | Get latest Constraint Configuration               | Open  |
| POST   | `/constraint/add`           | Add/Save Constraint Snapshot                      | Admin |
| GET    | `/constraint/history`       | Get Constraint History                            | Admin |
| GET    | `/examtab/get`              | Get Exam Settings                                 | Open  |
| POST   | `/examtab/post`             | Save Exam Settings                                | Admin |
| GET    | `/output/get`               | Get Output Configuration                          | Open  |
| POST   | `/output/save`              | Save Output Configuration                         | Admin |
| GET    | `/optimization/get`         | Get Optimization Settings                         | Open  |
| POST   | `/optimization/save`        | Save Optimization Settings                        | Admin |

---

## 📅 Period Exclusion Management

| Method | Endpoint                                | Description                          | RBAC  |
| ------ | --------------------------------------- | ------------------------------------ | ----- |
| GET    | `/api/periods/mapping`                  | Get Period Mapping (Grid Topology)   | Open  |
| GET    | `/api/periods/exclusions/active`        | Get Active Exclusion Snapshot        | Open  |
| POST   | `/api/periods/exclusions`               | Save New Exclusion Snapshot          | Admin |
| GET    | `/api/periods/exclusions/history`       | Get Exclusion History                | Open  |
| PUT    | `/api/periods/exclusions/{id}/activate` | Activate Specific Exclusion Snapshot | Admin |

---

## 🧠 Algorithm Engine

| Method | Endpoint             | Description                                     | RBAC  | Params                                                                |
| ------ | -------------------- | ----------------------------------------------- | ----- | --------------------------------------------------------------------- |
| POST   | `/algorithm/trigger` | Trigger the Timetable Generation Engine (Async) | Admin | `generalSettingsId`, `constraintId`, `exclusionSnapshotId` (optional) |

---

## 🔐 RBAC Legend

- **Public**: No authentication required
- **Open**: Authenticated, no scope restriction
- **Scoped**: Returns data based on user's College/Department scope (AD sees all, CR sees college, DR sees dept)
- **Admin**: Restricted to Administrators only (Role ID = 1, Code = "AD")
- **AD+CR**: Restricted to Administrators and College Representatives (Role IDs 1, 2)

---

## 📝 Notes

1. **Enrollment-First Principle**: Students must be enrolled in a semester (`/sem/reg`) before registering for courses (`/registration/post`).
2. **Append-Only Configuration**: Settings and Constraints use append-only pattern for audit history.
3. **Triple-Lock ID Bundle**: Algorithm trigger accepts specific IDs to ensure precise configuration usage.
4. **Security Fixes (Feb 2026)**: `Registrationserviceimp` and `StudentSemesterRegistrationserviceimp` now fetch managed entities to prevent NPE and enforce RBAC correctly.
