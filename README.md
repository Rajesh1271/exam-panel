# 🎓 Online Examination Panel with MongoDB Real-time Sync

A full-stack, dynamic online examination and administration portal built with **React (Vite + Tailwind CSS)** and **Node.js (Express + MongoDB / Mongoose)**.

---

## 🌟 Key Features

1. **MongoDB Dynamic Question Bank**:
   - Create, edit, search, and delete questions stored directly in MongoDB.
   - Assign questions to specific courses (e.g. React, Node.js, Python, Database Systems).
   - Real-time synchronization between the Admin/Teacher panels and the MongoDB question repository.

2. **Admin Real-time Activity Monitoring & Audit Logs**:
   - Track every event across the platform in real time:
     - User registrations & logins (Student, Teacher, Admin)
     - Question creations, modifications, and deletions
     - Exam creation, start, and submission events
     - Course management and student score adjustments
   - Search, filter by role/type (Auth, Question, Exam, Course, Result, User, System), and manage activity logs.

3. **Multi-Role Dashboards**:
   - **Administrator**: Comprehensive live statistics, activity audit trail, question bank manager, courses manager, teacher and student account controls.
   - **Instructor / Teacher**: Question builder, exam creator with question bank selector, student submission viewer with detailed answer evaluation.
   - **Student**: Exam portal with live countdown timer, interactive question navigation, auto-scoring, review page, and grade history.

4. **Zero-Configuration MongoDB Setup**:
   - Automatically connects to MongoDB Atlas or local MongoDB.
   - Built-in embedded fallback database ensures the website is immediately ready to use out of the box with sample questions and pre-configured courses.

---


*(You can also register new accounts anytime via the Signup page!)*

---

## 🚀 How to Run the Project

### 1. Start the Backend Server (Port 3300)
```bash
cd backend
npm install
npm start
# Or: node server.js
```

### 2. Start the Frontend Application (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

Open your browser and navigate to: `http://localhost:5173`

---

## 📡 API Endpoints Overview

- **Auth**: `/api/auth/signup`, `/api/auth/student-login`, `/api/auth/teacher-login`, `/api/auth/admin-login`, `/api/auth/dashboard`
- **Questions**: `GET/POST /api/questions`, `GET /api/questions/by-course/:courseId`, `PUT/DELETE /api/questions/:id`
- **Exams**: `GET/POST /api/exams`, `GET /api/exams/:id/start`, `POST /api/exams/:id/submit`, `DELETE /api/exams/:id`
- **Courses**: `GET/POST /api/courses`, `GET/PUT/DELETE /api/courses/:id`
- **Activities**: `GET /api/activities`, `GET /api/activities/stats`, `DELETE /api/activities/:id`, `DELETE /api/activities/clear/all`
- **Results**: `GET /api/results`, `GET /api/results/student/:studentId`, `PUT/DELETE /api/results/:id`
