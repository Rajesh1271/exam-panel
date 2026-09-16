const Course = require("../models/Course");
const { logActivity } = require("./activitycontroller");

// ==================== GET ALL COURSES ====================
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.status(200).json(courses);
  } catch (error) {
    console.error("getAllCourses error:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

// ==================== GET SINGLE COURSE ====================
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    res.status(200).json(course);
  } catch (error) {
    console.error("getCourseById error:", error);
    res.status(500).json({ error: "Failed to fetch course" });
  }
};

// ==================== CREATE COURSE ====================
exports.createCourse = async (req, res) => {
  try {
    const { name, teacher, duration, description } = req.body;

    if (!name || !teacher || !duration) {
      return res.status(400).json({ error: "Course name, teacher email, and duration are required" });
    }

    const newCourse = await Course.create({
      name: String(name).trim(),
      teacher: String(teacher).trim(),
      duration: String(duration).trim(),
      description: description ? String(description).trim() : ""
    });

    await logActivity({
      action: 'Course Created',
      details: `Created new course: "${newCourse.name}" (Duration: ${newCourse.duration}, Instructor: ${newCourse.teacher})`,
      type: 'course',
      user: 'Admin',
      role: 'admin'
    });

    res.status(201).json(newCourse);
  } catch (error) {
    console.error("createCourse error:", error);
    res.status(500).json({ error: "Failed to create course: " + error.message });
  }
};

// ==================== UPDATE COURSE ====================
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, teacher, duration, description } = req.body;

    const updated = await Course.findByIdAndUpdate(
      id,
      {
        name: name ? String(name).trim() : undefined,
        teacher: teacher ? String(teacher).trim() : undefined,
        duration: duration ? String(duration).trim() : undefined,
        description: description !== undefined ? String(description).trim() : undefined
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Course not found" });
    }

    await logActivity({
      action: 'Course Updated',
      details: `Updated course: "${updated.name}"`,
      type: 'course',
      user: 'Admin',
      role: 'admin'
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error("updateCourse error:", error);
    res.status(500).json({ error: "Failed to update course" });
  }
};

// ==================== DELETE COURSE ====================
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Course.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Course not found" });
    }

    await logActivity({
      action: 'Course Deleted',
      details: `Deleted course: "${deleted.name}"`,
      type: 'course',
      user: 'Admin',
      role: 'admin'
    });

    res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error("deleteCourse error:", error);
    res.status(500).json({ error: "Failed to delete course" });
  }
};