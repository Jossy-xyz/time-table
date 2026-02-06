# 🎓 Bells University Timetable Generator - Setup Guide

This guide ensures a smooth installation on a new machine. It addresses common issues like Gradle download timeouts and database connectivity.

---

## 🏗️ 1. Prerequisites

Ensure the following are installed:

- **Java SE Development Kit (JDK) 21 or 25**: Required for the Spring Boot backend.
- **Node.js (LTS)**: Required for the React frontend.
- **MySQL Server**: Required for the database.
- **Git**: To clone the repository.

---

## 🗄️ 2. Database Setup (MySQL)

1. Open your MySQL Command Line or Workbench.
2. Create the database:
   ```sql
   CREATE DATABASE examtt;
   ```
3. The backend is configured to use:
   - **User**: `root`
   - **Password**: (Empty)
   - **Port**: `3306`
     _(If you have a password, update it in `Backend/untitled2/src/main/resources/application.properties`)_

---

## ⚙️ 3. Backend Setup (Spring Boot)

The backend uses **Gradle**. If the automatic download fails (common on slow connections), follow the manual route.

### Automatic Method (Try first)

1. Open a terminal in `Backend/untitled2`.
2. Run:
   ```powershell
   ./gradlew.bat bootRun
   ```

## 🏗️ 3.1 Backend Alternative (Maven - Recommended for slow networks)

If Gradle is too large to download:

1.  I have created a `pom.xml` in your `Backend/untitled2` folder.
2.  **Download Maven Tiny**: [apache-maven-3.9.6-bin.zip](https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip) (~10MB).
3.  **Unzip** it anywhere.
4.  **Run**:
    ```powershell
    path/to/maven/bin/mvn spring-boot:run
    ```
    _(Maven is much better at resuming downloads for libraries than Gradle is for its own distribution)_

---

## 💻 4. Frontend Setup (React)

1. Open a terminal in `Timetable-generator`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```
4. Access the app at `http://localhost:3000`.

---

## 🔧 5. Integration Notes

- **API Base**: `http://localhost:8080`
- **Frontend**: Fully integrated with backend authentication
- **RBAC**: All requests include `X-Actor-Username` header
- **Security**: Role-based access control enforced on all endpoints

---

## 🔐 6. First Login

1. Create an admin user via API:

   ```bash
   POST http://localhost:8080/users/register
   {
     "username": "admin",
     "password": "your_password",
     "role": { "id": 1 },
     "email": "admin@bellsuniversity.edu.ng"
   }
   ```

2. Login via frontend at `http://localhost:3000`

3. The system will automatically enforce RBAC based on your role.

---

## 🛠️ Troubleshooting

- **Gradle Download Failure**: Increase timeouts in `gradle/wrapper/gradle-wrapper.properties` to `600000` (10 minutes).
- **CORS Errors**: The backend is configured to allow `http://localhost:3000`. If you use a different port, update `@CrossOrigin` in your Java Controllers.
- **TypeScript Version Mismatch**: If you see a "WARNING: You are currently running a version of TypeScript which is not officially supported" error during `npm start`, add `WARN_ON_UNSUPPORTED_TYPESCRIPT_VERSION=true` to your `Timetable-generator/.env` file to bypass the preflight check.
