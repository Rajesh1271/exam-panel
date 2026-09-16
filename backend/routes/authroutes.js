const express = require('express');
const router = express.Router();
const authctrl = require("../controller/authcontroller");

// User signup
router.post('/signup', authctrl.Signup);
router.post('/Signup', authctrl.Signup);

// Student login (support both camel/kebab cases)
router.post('/student-login', authctrl.Student);
router.post('/Student-login', authctrl.Student);

// Teacher login
router.post('/teacher-login', authctrl.Teacher);
router.post('/Teacher-login', authctrl.Teacher);

// Admin login
router.post('/admin-login', authctrl.Admin);
router.post('/Admin-login', authctrl.Admin);

// Admin dashboard stats
router.get("/dashboard", authctrl.getDashboardStats);

// Admin view all users
router.get("/dashboard/users", authctrl.getAllUsers);

// Admin recent users
router.get("/dashboard/recent-users", authctrl.getRecentUsers);

// Admin-dashboard teacher information
router.get("/teachers", authctrl.getAllTeachers);

// Admin delete teacher
router.delete("/teachers/:id", authctrl.deleteTeacher);

// Admin-dashboard student information
router.get("/students", authctrl.getAllStudents);

// Admin delete student
router.delete("/students/:id", authctrl.deleteStudent);

// Teacher dashboard stats
router.get("/teacher/dashboard", authctrl.getTeacherDashboardStats);

// Teacher view all their students
router.get("/teacher/students", authctrl.getAllStudentsForTeacher);

// Profile photo update (MongoDB sync)
router.put("/profile-photo", authctrl.updateProfilePhoto);
router.post("/profile-photo", authctrl.updateProfilePhoto);

// User Profile fetch
router.get("/profile/:id", authctrl.getProfile);
router.get("/profile", authctrl.getProfile);

module.exports = router;
