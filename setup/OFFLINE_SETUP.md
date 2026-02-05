# 🔒 Fully Offline Project Setup (Automated)

I have created an automated **`setup/`** folder to make moving this project to another machine simple and reliable.

---

## 📂 1. Before You Move (On THIS Machine)

Go to the `setup/scripts/` folder and run these as needed:

1.  **Prepare Distribution**: Place your `gradle-8.14.4-all.zip` into `setup/gradle-dist/`.
2.  **Package Your Libraries**: Run **`save-cache.bat`**.
    - This will automatically zip your downloaded libraries into `setup/gradle-cache.zip`.

**Your USB/Bundle should now have:**

- `Timetable-generator` (Project)
- `setup/` (With the zip and scripts)

---

## 🚀 2. Setting Up (On the NEW Machine)

### Step 1: Initialize (Fully Automated)

1.  Navigate to `setup/scripts/`.
2.  Run **`init-offline.bat`** (Run as Administrator).
    - **What this does now:**
      - Automatically detects any zip in `gradle-dist/` and copies it to `C:\Gradle\`.
      - **One-Hot Download**: If the distribution is missing, it offers to download it for you.
      - Automatically extracts `gradle-cache.zip` into your user profile.
      - **Dependency Check**: Automatically checks for `node_modules` and offers to install them if missing.

### Step 2: Run

1.  Open terminal in `Backend/untitled2`.
2.  Run:
    ```powershell
    ./gradlew.bat bootRun --offline
    ```

---

## 📝 3. Configuration Details

- **Java**: Fixed to **Java 25** (matches your machine).
- **Registry Search**: All search features (Students, Courses, Staff, Venues) are preserved.
- **API**: Ready to talk to the local Spring Boot backend.

---

## 💻 4. Frontend Reminder

Don't forget to run `npm install` inside the `Timetable-generator` folder while you have internet access, so the `node_modules` folder is ready to go offline.
