const User = require('../models/user');
const Course = require('../models/Course');
const Question = require('../models/Question');
const Exam = require('../models/exam');
const Result = require('../models/result');
const Activity = require('../models/Activity');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logActivity } = require('./activitycontroller');

// ==================== SIGNUP ====================
exports.Signup = async (req, res) => {
  const { name, username, email, password, role, profilePic } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const chosenName = name || username || email.split('@')[0];
    const chosenUsername = username || name || email.split('@')[0];

    // Create new user
    const newUser = await User.create({
      name: chosenName,
      username: chosenUsername,
      email: String(email).toLowerCase().trim(),
      password: hashedPassword,
      role: role || 'student',
      profilePic: profilePic || ''
    });

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || 'verysecretkey12345',
      { expiresIn: '7d' }
    );

    // Log Activity
    await logActivity({
      action: 'User Registered',
      details: `New account registered: "${chosenName}" (${email}) with role [${newUser.role}]`,
      type: 'auth',
      user: chosenName,
      userId: newUser._id,
      role: newUser.role
    });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: newUser._id,
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        profilePic: newUser.profilePic || ''
      }
    });

  } catch (err) {
    console.error("Signup error:", err.message);
    return res.status(500).json({ error: "Server error during registration: " + err.message });
  }
};

// ==================== STUDENT LOGIN ====================
exports.Student = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'verysecretkey12345',
      { expiresIn: '7d' }
    );

    // Log Activity
    await logActivity({
      action: 'Student Logged In',
      details: `Student "${user.name || user.username || user.email}" signed in`,
      type: 'auth',
      user: user.name || user.username || user.email,
      userId: user._id,
      role: 'student'
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      userId: user._id,
      studentId: user._id,
      role: user.role,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name || user.username,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic || ''
      }
    });
  } catch (err) {
    console.error("Student login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
};

// ==================== TEACHER LOGIN ====================
exports.Teacher = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    if (user.role !== "teacher" && user.role !== "admin") {
      return res.status(403).json({ error: "Access denied! Not a teacher." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'verysecretkey12345',
      { expiresIn: '7d' }
    );

    // Log Activity
    await logActivity({
      action: 'Teacher Logged In',
      details: `Teacher "${user.name || user.username}" signed in`,
      type: 'auth',
      user: user.name || user.username,
      userId: user._id,
      role: 'teacher'
    });

    return res.status(200).json({
      message: "Teacher login successful",
      token,
      userId: user._id,
      role: user.role,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name || user.username,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic || ''
      }
    });
  } catch (err) {
    console.error("Teacher login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
};

// ==================== ADMIN LOGIN ====================
exports.Admin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ error: "Invalid admin credentials" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Access denied! You are not an admin." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'verysecretkey12345',
      { expiresIn: '7d' }
    );

    // Log Activity
    await logActivity({
      action: 'Admin Logged In',
      details: `Administrator "${user.name || user.username || user.email}" accessed Admin Panel`,
      type: 'auth',
      user: user.name || user.username || user.email,
      userId: user._id,
      role: 'admin'
    });

    return res.status(200).json({
      token,
      message: "Admin login successful!",
      role: user.role,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name || user.username,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic || ''
      }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ error: "Server error during admin login" });
  }
};

// ==================== UPDATE PROFILE PHOTO ====================
exports.updateProfilePhoto = async (req, res) => {
  try {
    const { userId, email, role, profilePic } = req.body;

    if (profilePic === undefined || profilePic === null) {
      return res.status(400).json({ error: "Profile photo data/URL is required" });
    }

    const mongoose = require('mongoose');
    let user = null;
    let targetId = userId;

    if (!targetId || targetId === 'undefined' || targetId === 'null') {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'verysecretkey12345');
          targetId = decoded.userId || decoded.id;
        } catch (e) {}
      }
    }

    if (targetId && mongoose.isValidObjectId(targetId)) {
      try {
        user = await User.findById(targetId);
      } catch (e) {}
    }

    if (!user && email) {
      try {
        user = await User.findOne({ email: String(email).toLowerCase().trim() });
      } catch (e) {}
    }

    if (!user && role) {
      try {
        user = await User.findOne({ role: String(role).toLowerCase().trim() });
      } catch (e) {}
    }

    if (!user) {
      user = await User.findOne({ role: 'admin' }) || await User.findOne();
    }

    if (!user) {
      user = await User.create({
        name: role ? `${role.charAt(0).toUpperCase() + role.slice(1)} User` : 'User',
        email: email || `${role || 'admin'}@exam.com`,
        username: role || 'admin',
        role: role || 'admin',
        password: 'password123',
        profilePic: profilePic || ''
      });
    } else {
      user.profilePic = profilePic || '';
      await user.save();
    }

    // Log Activity in MongoDB
    await logActivity({
      action: 'Profile Photo Updated',
      details: `User "${user.name || user.username || user.email}" (${user.role}) updated their profile picture in MongoDB`,
      type: 'user',
      user: user.name || user.username || user.email,
      userId: user._id,
      role: user.role
    });

    const { emitRealtimeEvent } = require('../utils/socketEmitter');
    emitRealtimeEvent('userUpdated', {
      _id: user._id,
      id: user._id,
      role: user.role,
      profilePic: user.profilePic
    });

    return res.status(200).json({
      success: true,
      message: "Profile photo updated successfully in MongoDB!",
      user: {
        _id: user._id,
        id: user._id,
        name: user.name || user.username,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic
      }
    });
  } catch (err) {
    console.error("updateProfilePhoto error:", err);
    return res.status(500).json({ error: "Failed to update profile picture: " + err.message });
  }
};

// ==================== GET USER PROFILE ====================
exports.getProfile = async (req, res) => {
  try {
    const { id } = req.params;
    let user = null;
    if (id && id !== 'undefined' && id !== 'dev-auto-student') {
      try {
        user = await User.findById(id).select('-password');
      } catch (e) {}
    }
    if (!user) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
          const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'verysecretkey12345');
          if (decoded.userId) {
            user = await User.findById(decoded.userId).select('-password');
          }
        } catch (e) {}
      }
    }

    if (!user) return res.status(404).json({ error: "User not found" });
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("getProfile error:", err);
    return res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

// ==================== DASHBOARD STATS ====================
exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalTeacher = await User.countDocuments({ role: "teacher" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalCourses = await Course.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalExams = await Exam.countDocuments();
    const totalResults = await Result.countDocuments();
    const totalActivities = await Activity.countDocuments();

    // Fetch recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select("_id name username email role profilePic createdAt");

    // Fetch recent activities
    const recentActivities = await Activity.find()
      .sort({ timestamp: -1 })
      .limit(6);

    const formattedRecentUsers = recentUsers.map(u => ({
      _id: u._id,
      name: u.name || u.username || u.email.split('@')[0],
      username: u.username || u.name,
      email: u.email,
      role: u.role,
      profilePic: u.profilePic || '',
      createdAt: u.createdAt
    }));

    res.status(200).json({
      totalStudents,
      totalTeacher,
      totalAdmins,
      totalCourses,
      totalQuestions,
      totalExams,
      totalResults,
      totalActivities,
      recentUsers: formattedRecentUsers,
      recentActivities
    });

  } catch (error) {
    console.error("getDashboardStats error:", error);
    res.status(500).json({ message: "Server error fetching stats" });
  }
};

// ==================== ADMIN VIEW ALL USERS ====================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select("_id name username email role profilePic createdAt");
    const totalStudents = users.filter(u => u.role === "student").length;
    const totalTeachers = users.filter(u => u.role === "teacher").length;
    const totalAdmins = users.filter(u => u.role === "admin").length;

    const formattedUsers = users.map(u => ({
      _id: u._id,
      name: u.name || u.username || u.email.split('@')[0],
      username: u.username,
      email: u.email,
      role: u.role,
      profilePic: u.profilePic || '',
      createdAt: u.createdAt
    }));

    res.status(200).json({
      totalUsers: users.length,
      totalStudents,
      totalTeachers,
      totalAdmins,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("getAllUsers error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// ==================== RECENT USERS ====================
exports.getRecentUsers = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select("_id name username email role profilePic createdAt");

    const formattedUsers = users.map(u => ({
      _id: u._id,
      name: u.name || u.username || u.email.split('@')[0],
      username: u.username,
      email: u.email,
      role: u.role,
      profilePic: u.profilePic || '',
      createdAt: u.createdAt
    }));

    res.status(200).json({ users: formattedUsers });
  } catch (error) {
    console.error("getRecentUsers error:", error);
    res.status(500).json({ message: "Failed to fetch recent users" });
  }
};

// ==================== TEACHERS ====================
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: "teacher" }).sort({ createdAt: -1 }).select("_id name username email role profilePic createdAt");
    const formatted = teachers.map(t => ({
      _id: t._id,
      name: t.name || t.username || t.email.split('@')[0],
      username: t.username,
      email: t.email,
      role: t.role,
      profilePic: t.profilePic || '',
      createdAt: t.createdAt
    }));

    res.status(200).json({
      success: true,
      teachers: formatted,
    });
  } catch (error) {
    console.error("getAllTeachers error:", error);
    res.status(500).json({ message: "Failed to fetch teachers" });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTeacher = await User.findByIdAndDelete(id);

    if (!deletedTeacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    await logActivity({
      action: 'Teacher Deleted',
      details: `Removed teacher account: "${deletedTeacher.name || deletedTeacher.username || deletedTeacher.email}"`,
      type: 'user',
      user: 'Admin',
      role: 'admin'
    });

    res.status(200).json({ success: true, message: "Teacher deleted successfully" });
  } catch (err) {
    console.error("Delete teacher error:", err.message);
    res.status(500).json({ error: "Server error deleting teacher" });
  }
};

// ==================== STUDENTS ====================
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).sort({ createdAt: -1 }).select("_id name username email role profilePic createdAt");
    const formatted = students.map(s => ({
      _id: s._id,
      name: s.name || s.username || s.email.split('@')[0],
      username: s.username,
      email: s.email,
      role: s.role,
      profilePic: s.profilePic || '',
      createdAt: s.createdAt
    }));

    res.status(200).json({
      success: true,
      students: formatted,
    });
  } catch (error) {
    console.error("getAllStudents error:", error);
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStudent = await User.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    await logActivity({
      action: 'Student Deleted',
      details: `Removed student account: "${deletedStudent.name || deletedStudent.username || deletedStudent.email}"`,
      type: 'user',
      user: 'Admin/Teacher',
      role: 'admin'
    });

    res.status(200).json({ success: true, message: "Student deleted successfully" });
  } catch (err) {
    console.error("Delete student error:", err);
    res.status(500).json({ error: "Server error deleting student" });
  }
};

// ==================== TEACHER DASHBOARD ====================
exports.getTeacherDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalQuestions = await Question.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalExams = await Exam.countDocuments();
    const recentActivities = await Activity.find().sort({ timestamp: -1 }).limit(5);

    res.status(200).json({
      totalStudents,
      totalQuestions,
      totalCourses,
      totalExams,
      recentActivities
    });
  } catch (error) {
    console.error("Teacher Dashboard Error:", error);
    res.status(500).json({ message: "Server error fetching teacher stats" });
  }
};

exports.getAllStudentsForTeacher = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).sort({ createdAt: -1 });
    const formatted = students.map(s => ({
      _id: s._id,
      name: s.name || s.username || s.email.split('@')[0],
      username: s.username || s.name,
      email: s.email,
      role: s.role,
      profilePic: s.profilePic || '',
      createdAt: s.createdAt
    }));
    res.json({ students: formatted });
  } catch (error) {
    return res.status(500).json({ error: "Server error fetching students" });
  }
};