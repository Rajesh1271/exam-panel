const express = require("express");
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  createCourse,
  deleteCourse,
  updateCourse
} = require("../controller/courseController");

// Get all courses
router.get("/", getAllCourses);

// Get course by ID
router.get("/:id", getCourseById);

// Create a new course
router.post("/", createCourse);

// Delete a course by ID
router.delete("/:id", deleteCourse);

// Update a course by ID
router.put("/:id", updateCourse);

module.exports = router;