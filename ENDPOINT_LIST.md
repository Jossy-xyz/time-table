# 📡 API Endpoint Reference

Base URL: `http://localhost:8080`

## 👤 User & Authentication

| Method | Endpoint            | Description                                              |
| ------ | ------------------- | -------------------------------------------------------- |
| POST   | `/users/login`      | Authenticate user credentials and retrieve token/details |
| POST   | `/users/register`   | Register a new user (Raw Entity Payload)                 |
| GET    | `/users/all`        | List all registered users                                |
| GET    | `/users/{username}` | Get user details by username                             |

## 🏫 Institutional Management

| Method | Endpoint          | Description               |
| ------ | ----------------- | ------------------------- |
| GET    | `/centre/get`     | List all Centres/Colleges |
| POST   | `/centre/add`     | Add a new Centre          |
| GET    | `/department/get` | List all Departments      |
| POST   | `/department/add` | Add a new Department      |
| GET    | `/program/get`    | List all Programs         |
| POST   | `/program/add`    | Add a new Program         |
| GET    | `/venue/get`      | List all Venues           |
| POST   | `/venue/add`      | Add a new Venue           |
| GET    | `/staff/get`      | List all Staff members    |
| POST   | `/staff/add`      | Add a new Staff member    |
| GET    | `/student/get`    | List all Students         |
| POST   | `/student/add`    | Add a new Student         |

## 📚 Academic Registration

| Method | Endpoint            | Description                             |
| ------ | ------------------- | --------------------------------------- |
| GET    | `/course/get`       | List all Courses                        |
| POST   | `/course/add`       | Add a new Course                        |
| GET    | `/sem/get`          | List all Student Semester Registrations |
| POST   | `/sem/reg`          | Register a Student for a Semester       |
| PUT    | `/sem/update/{id}`  | Update Semester Registration            |
| DELETE | `/sem/delete/{id}`  | Delete Semester Registration            |
| GET    | `/registration/get` | List all Course Enrollments             |
| POST   | `/registration/add` | Enroll Student in a Course              |

## ⚙️ Configuration & Settings

| Method | Endpoint                 | Description                                       |
| ------ | ------------------------ | ------------------------------------------------- |
| GET    | `/settings/general`      | Get Global Schedule Settings (Session, Sem, Grid) |
| POST   | `/settings/general`      | Update Global Schedule Settings                   |
| GET    | `/constraint/get/latest` | Get latest Constraint Configuration               |
| POST   | `/constraint/add`        | Add single constraint (Individual)                |
| POST   | `/constraint/save-all`   | Save all constraints (Bulk)                       |
| GET    | `/examtab/get`           | Get Exam Settings                                 |
| POST   | `/examtab/post`          | Save Exam Settings                                |
| GET    | `/output/get`            | Get Output Configuration                          |
| POST   | `/output/save`           | Save Output Configuration                         |
| GET    | `/optimization/get`      | Get Optimization Settings                         |
| POST   | `/optimization/save`     | Save Optimization Settings                        |

## 🧠 Algorithm Engine

| Method | Endpoint             | Description                                     |
| ------ | -------------------- | ----------------------------------------------- |
| POST   | `/algorithm/trigger` | Trigger the Timetable Generation Engine (Async) |
