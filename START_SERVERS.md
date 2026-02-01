# 🚀 Starting the Servers - Timetable Generator

This guide provides step-by-step instructions for starting both the **Frontend** and **Backend** servers for the Bells University Timetable Generator application.

---

## 📋 Prerequisites

Before starting the servers, ensure you have:

- ✅ **Java JDK** installed (v17 or higher, currently using Java 25)
- ✅ **Gradle** (included via gradlew wrapper)
- ✅ **Node.js** installed (v14.0.0 or higher)
- ✅ **npm** installed (comes with Node.js)
- ✅ **MySQL** database server running
- ✅ Database configured and seeded (see `Database/seed_data.sql`)

---

## 🎯 Quick Start (Both Servers)

### Option 1: Start Both Servers Simultaneously

Open **two separate terminal windows** and run:

#### Terminal 1 - Backend Server (Spring Boot)

```bash
cd Backend/untitled2
./gradlew bootRun
```

#### Terminal 2 - Frontend Server (React)

```bash
cd Timetable-generator
npm start
```

### Option 2: Using PowerShell (Windows)

Run this command from the project root to start both servers:

```powershell
# Start Backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Backend/untitled2; ./gradlew bootRun"

# Start Frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd Timetable-generator; npm start"
```

---

## 🖥️ Backend Server (Spring Boot)

### Location

```
Backend/untitled2/
```

### Start Commands

#### Using Gradle Wrapper (Recommended)

```bash
cd Backend/untitled2
./gradlew bootRun          # Windows/Linux/Mac
# OR
gradlew.bat bootRun        # Windows explicitly
```

#### Build and Run JAR

```bash
cd Backend/untitled2
./gradlew build
java -jar build/libs/untitled2-0.0.1-SNAPSHOT.jar
```

#### Clean Build (if needed)

```bash
cd Backend/untitled2
./gradlew clean build bootRun
```

### Server Details

- **Framework**: Spring Boot 3.5.4
- **Java Version**: 25
- **Port**: `8080` (default Spring Boot port)
- **URL**: `http://localhost:8080`
- **Database**: MySQL (JPA/Hibernate)

### Environment Setup

Create an `application.properties` file in `Backend/untitled2/src/main/resources/` with:

```properties
# Server Configuration
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/timetable_db
spring.datasource.username=your_mysql_user
spring.datasource.password=your_mysql_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# Logging
logging.level.org.springframework=INFO
logging.level.com.example=DEBUG
```

### Verify Backend is Running

Open browser and visit:

```
http://localhost:8080
```

You should see the Spring Boot application running (or check specific API endpoints).

---

## 🎨 Frontend Server (React)

### Location

```
Timetable-generator/
```

### Start Commands

#### Development Mode

```bash
cd Timetable-generator
npm install          # Install dependencies (first time only)
npm start           # Start development server
```

#### Production Build

```bash
cd Timetable-generator
npm install          # Install dependencies (first time only)
npm run build       # Create production build
```

### Server Details

- **Port**: `3000` (default)
- **URL**: `http://localhost:3000`
- **Auto-opens**: Browser opens automatically
- **Hot Reload**: Changes auto-refresh

### Verify Frontend is Running

The browser should automatically open to:

```
http://localhost:3000
```

You should see the login page.

---

## 🔍 Troubleshooting

### Backend Issues

#### Port Already in Use (8080)

```bash
# Windows - Kill process on port 8080
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

#### Database Connection Failed

- ✅ Check MySQL is running
- ✅ Verify `application.properties` credentials
- ✅ Ensure database exists: `timetable_db`
- ✅ Check if data is seeded

#### Gradle Build Failed

```bash
cd Backend/untitled2
./gradlew clean
./gradlew build --refresh-dependencies
```

#### Gradle Daemon File Lock Issue ("Address already in use")

If you see an error like `FileLockContentionHandler ... Address already in use`, it means a Gradle daemon process is stuck.

**Fix:** Stop all Gradle values before restarting:

```bash
cd Backend/untitled2
./gradlew --stop
./gradlew bootRun
```

#### Java Version Issues

```bash
# Check Java version
java -version

# Should be Java 17 or higher (currently using Java 25)
```

### Frontend Issues

#### Port Already in Use (3000)

```bash
# Windows - Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### Compilation Errors

```bash
cd Timetable-generator
rm -rf node_modules package-lock.json
npm install
npm start
```

#### API Connection Failed

- ✅ Ensure backend is running on port 8080
- ✅ Check CORS settings in Spring Boot backend
- ✅ Verify API endpoints in frontend code

---

## 📊 Server Status Check

### Check if Servers are Running

#### Backend (Spring Boot)

```bash
# Windows PowerShell
Test-NetConnection -ComputerName localhost -Port 8080
```

#### Frontend (React)

```bash
# Windows PowerShell
Test-NetConnection -ComputerName localhost -Port 3000
```

### View Running Processes

```bash
# Windows - View Java processes
tasklist | findstr java

# Windows - View Node processes
tasklist | findstr node
```

---

## 🛑 Stopping the Servers

### Stop Individual Server

In the terminal running the server, press:

```
Ctrl + C
```

### Stop All Java Processes (Windows)

```bash
# ⚠️ WARNING: This stops ALL Java processes
taskkill /F /IM java.exe
```

### Stop All Node Processes (Windows)

```bash
# ⚠️ WARNING: This stops ALL Node.js processes
taskkill /F /IM node.exe
```

---

## 📱 Access Points

Once both servers are running:

| Service         | URL                             | Purpose             |
| --------------- | ------------------------------- | ------------------- |
| **Frontend**    | http://localhost:3000           | Main application UI |
| **Backend API** | http://localhost:8080           | REST API endpoints  |
| **Login Page**  | http://localhost:3000/login     | Authentication      |
| **Dashboard**   | http://localhost:3000/dashboard | Main dashboard      |

---

## 🔐 Default Login Credentials

For testing purposes (check with your admin for current credentials):

```
Username: admin
Password: admin123
```

---

## 📝 Development Workflow

### Recommended Startup Order

1. **Start Database** (MySQL)
2. **Start Backend** (Spring Boot on port 8080)
3. **Start Frontend** (React on port 3000)
4. **Open Browser** (http://localhost:3000)

### Daily Development

```bash
# Morning startup
cd Backend/untitled2 && ./gradlew bootRun    # Terminal 1
cd Timetable-generator && npm start          # Terminal 2

# Make changes to code
# Frontend auto-reloads on save
# Backend needs restart for changes (or use Spring DevTools)

# End of day
# Press Ctrl+C in both terminals
```

---

## 🚀 Production Deployment

For production deployment, see:

- `QUICK_START_DEPLOYMENT.md` - Deployment guide
- `EXECUTIVE_SUMMARY.md` - System overview

---

## 📞 Need Help?

### Documentation

- **Frontend Guide**: `FRONTEND_IMPLEMENTATION_GUIDE.md`
- **Login Guide**: `LOGIN_IMPLEMENTATION_GUIDE.md`
- **Quick Reference**: `FRONTEND_QUICK_REFERENCE.md`
- **Database Setup**: `Database/CONVERSION_SUMMARY.md`

### Common Issues

- **Compilation Fixes**: `COMPILATION_FIXES.md`
- **Verification**: `FINAL_VERIFICATION_CHECKLIST.md`

---

## ✅ Success Checklist

Before you start working, ensure:

- [ ] MySQL database is running
- [ ] Backend server started successfully (port 8080)
- [ ] Frontend server started successfully (port 3000)
- [ ] Login page loads at http://localhost:3000
- [ ] No console errors in browser (F12)
- [ ] Backend API responds

---

## 🎉 You're Ready!

Both servers should now be running. Happy coding! 🚀

**Commands Summary:**

```bash
# Backend (Spring Boot)
cd Backend/untitled2 && ./gradlew bootRun

# Frontend (React)
cd Timetable-generator && npm start
```

**Last Updated**: January 24, 2026  
**Status**: ✅ Production Ready
