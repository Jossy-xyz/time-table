# 🎓 Bells University Timetable Generator

**Enterprise-Grade Examination Timetable Management System**

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)]()
[![RBAC](https://img.shields.io/badge/Security-RBAC%20Enabled-blue)]()
[![Backend](https://img.shields.io/badge/Backend-Spring%20Boot-green)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%2018-blue)]()

---

## 📋 Overview

The Bells University Timetable Generator is a comprehensive web-based system for managing examination timetables across multiple colleges and departments. It features role-based access control, institutional constraints management, period exclusion calendars, and an intelligent algorithm engine.

### Key Features

- ✅ **Role-Based Access Control (RBAC)** - Hierarchical permissions (Admin, College Rep, Dept Rep, Staff)
- ✅ **Multi-College Support** - Manage 4+ colleges with department-level granularity
- ✅ **Institutional Constraints** - Define complex scheduling rules and preferences
- ✅ **Period Exclusion Calendar** - Visual grid for blocking unavailable time slots
- ✅ **Algorithm Engine** - Automated timetable generation with conflict resolution
- ✅ **Audit History** - Track all configuration changes with append-only pattern
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile devices
- ✅ **Dark/Light Mode** - User-preferred theme with persistent storage

---

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   React 18      │ ───▶ │  Spring Boot 3.x │ ───▶ │   MySQL 8.x     │
│   Frontend      │      │    REST API      │      │   Database      │
│  (Port 3000)    │      │   (Port 8080)    │      │  (Port 3306)    │
└─────────────────┘      └──────────────────┘      └─────────────────┘
```

### Tech Stack

**Frontend:**

- React 18 with TypeScript
- Zustand (State Management)
- Framer Motion (Animations)
- React Router v6
- React Toastify (Notifications)

**Backend:**

- Spring Boot 3.x
- Spring Data JPA
- MySQL Connector
- BCrypt (Password Hashing)
- Policy Enforcement Service (RBAC)

**Database:**

- MySQL 8.x
- UTF-8 Character Set
- Relational Schema with Foreign Keys

---

## 🚀 Quick Start

### Prerequisites

- **Java JDK 21+** (for Spring Boot)
- **Node.js 18+ LTS** (for React)
- **MySQL 8.x** (for Database)
- **Git** (for version control)

### 1. Clone Repository

```bash
git clone <repository-url>
cd time-table
```

### 2. Database Setup

```sql
CREATE DATABASE examtt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Update `Backend/untitled2/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/examtt
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

### 3. Start Backend

```bash
cd Backend/untitled2
./gradlew bootRun --continuous
```

Backend runs on: `http://localhost:8080`

### 4. Start Frontend

```bash
cd Timetable-generator
npm install
npm start
```

Frontend runs on: `http://localhost:3000`

### 5. Login

Default credentials (create via `/users/register` endpoint):

- **Admin**: `roleId = 1`, `roleCode = "AD"`
- **College Rep**: `roleId = 2`, `roleCode = "CR"`
- **Dept Rep**: `roleId = 3`, `roleCode = "DR"`
- **Staff**: `roleId = 4`, `roleCode = "ST"`

---

## 📚 Documentation

### Core Documentation

- **[ENDPOINT_LIST.md](ENDPOINT_LIST.md)** - Complete API reference with RBAC annotations
- **[REFACTOR_TODO.md](REFACTOR_TODO.md)** - Implementation roadmap and progress tracker
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed installation instructions

### Technical Guides

- **[docs/RBAC_IMPLEMENTATION.md](docs/RBAC_IMPLEMENTATION.md)** - Security architecture and audit findings
- **[docs/PERIOD_EXCLUSION_BACKEND.md](docs/PERIOD_EXCLUSION_BACKEND.md)** - Period exclusion system design
- **[docs/DATABASE_SCHEMA_EVOLUTION.md](docs/DATABASE_SCHEMA_EVOLUTION.md)** - Database structure and migrations
- **[notes/ALGORITHM_INTEGRATION_SPECS.md](notes/ALGORITHM_INTEGRATION_SPECS.md)** - Algorithm engine specifications
- **[notes/backend_audit_report.md](notes/backend_audit_report.md)** - Security audit results (Feb 2026)

---

## 🔐 Security & RBAC

### Role Hierarchy

| Role              | ID  | Code | Scope        | Access                        |
| ----------------- | --- | ---- | ------------ | ----------------------------- |
| **Administrator** | 1   | AD   | Global       | All entities, all operations  |
| **College Rep**   | 2   | CR   | College-wide | All depts in college + Venues |
| **Dept Rep**      | 3   | DR   | Department   | Own department only           |
| **Staff**         | 4   | ST   | Department   | Own department only           |

### Access Control Matrix

| Entity      | AD         | CR         | DR      | ST      |
| ----------- | ---------- | ---------- | ------- | ------- |
| Students    | ✅ All     | ✅ College | ✅ Dept | ✅ Dept |
| Courses     | ✅ All     | ✅ College | ✅ Dept | ✅ Dept |
| Staff       | ✅ All     | ✅ College | ✅ Dept | ✅ Dept |
| Venues      | ✅ All     | ✅ All     | ❌      | ❌      |
| Settings    | ✅ Modify  | ❌         | ❌      | ❌      |
| Constraints | ✅ Modify  | ❌         | ❌      | ❌      |
| Algorithm   | ✅ Trigger | ❌         | ❌      | ❌      |

**All requests require `X-Actor-Username` header for RBAC enforcement.**

---

## 🎯 Key Workflows

### 1. Student Course Registration

**Prerequisite:** Student must be enrolled in semester first.

```bash
# Step 1: Enroll student in semester
POST /sem/reg
{
  "student": { "id": 1 },
  "session": "2024/2025",
  "semester": "1",
  "level": "100"
}

# Step 2: Register student for course
POST /registration/post
{
  "student": { "id": 1 },
  "course": { "id": 105 },
  "session": "2024/2025",
  "semester": "1"
}
```

### 2. Timetable Generation

```bash
# Step 1: Configure General Settings
POST /settings/general
{ "session": "2024/2025", "semester": "1", ... }

# Step 2: Define Constraints
POST /constraint/add
{ "name": "Snapshot 1", ... }

# Step 3: Set Period Exclusions
POST /api/periods/exclusions
{ "name": "Exclusion Set 1", "excludedPeriods": [0, 5, 10] }

# Step 4: Trigger Algorithm
POST /algorithm/trigger?generalSettingsId=1&constraintId=1&exclusionSnapshotId=1
```

---

## 🛠️ Development

### Project Structure

```
time-table/
├── Backend/untitled2/          # Spring Boot API
│   ├── src/main/java/
│   │   └── com/example/springproject/
│   │       ├── controller/     # REST Controllers
│   │       ├── service/        # Business Logic + RBAC
│   │       ├── repository/     # Data Access
│   │       ├── model/          # JPA Entities
│   │       └── dto/            # Data Transfer Objects
│   └── src/main/resources/
│       └── application.properties
│
├── Timetable-generator/        # React Frontend
│   ├── src/
│   │   ├── pages/              # Page Components
│   │   ├── components/         # Reusable Components
│   │   ├── services/           # API Services
│   │   └── types/              # TypeScript Types
│   └── public/
│
├── docs/                        # Technical Documentation
├── notes/                       # Implementation Notes
└── Database/                    # SQL Scripts
```

### Running Tests

```bash
# Backend
cd Backend/untitled2
./gradlew test

# Frontend
cd Timetable-generator
npm test
```

### Building for Production

```bash
# Backend (creates JAR)
cd Backend/untitled2
./gradlew build

# Frontend (creates optimized build)
cd Timetable-generator
npm run build
```

---

## 🐛 Troubleshooting

### Common Issues

**1. CORS Errors**

- Ensure backend `@CrossOrigin` allows `http://localhost:3000`
- Check `X-Actor-Username` header is being sent

**2. 403 Forbidden**

- Verify user has correct `roleCode` and `roleId`
- Check RBAC logs in backend console

**3. NPE on Registration**

- Ensure student is enrolled in semester first (Enrollment-First Principle)
- Verify student/course IDs exist in database

**4. Gradle Download Timeout**

- Increase timeout in `gradle/wrapper/gradle-wrapper.properties`
- Alternative: Use Maven (`pom.xml` provided)

---

## 📊 Recent Updates (Feb 2026)

### Security Audit & Fixes

- ✅ Fixed NPE vulnerability in `Registrationserviceimp`
- ✅ Fixed NPE vulnerability in `StudentSemesterRegistrationserviceimp`
- ✅ Verified RBAC enforcement across all 17 controllers
- ✅ Updated API documentation with security annotations

### Features

- ✅ Period Exclusion Calendar with visual grid
- ✅ Triple-Lock ID Bundle for precise configuration
- ✅ Append-only configuration history
- ✅ Frontend RBAC with UI hiding (not just disabling)

---

## 📝 License

Proprietary - Bells University

---

## 👥 Contributors

- **Development**: Antigravity AI
- **Institution**: Bells University
- **Status**: Production Ready ✅

---

## 📞 Support

For technical issues or questions:

- Review documentation in `/docs` and `/notes`
- Check `REFACTOR_TODO.md` for known issues
- See `ENDPOINT_LIST.md` for API reference

---

**Last Updated:** February 1, 2026  
**Version:** 4.0  
**Status:** Production Ready ✅
