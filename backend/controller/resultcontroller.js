const mongoose = require('mongoose');
const Result = require('../models/result');
const Exam = require('../models/exam');
const User = require('../models/user');
const { logActivity } = require('./activitycontroller');

// ==================== GET ALL RESULTS ====================
exports.getAllResults = async (req, res) => {
  try {
    const results = await Result.find()
      .populate("studentId", "name username email role profilePic")
      .populate("examId", "title examname examcode totalMarks durationMinutes enableRankings isPractice")
      .sort({ createdAt: -1 });

    const formatted = results.map(r => ({
      _id: r._id,
      student: r.studentId,
      studentId: r.studentId,
      exam: r.examId,
      examId: r.examId,
      score: r.score,
      maxScore: r.maxScore,
      percentage: r.percentage || (r.maxScore > 0 ? Math.round((r.score / r.maxScore) * 100) : 0),
      status: r.status || (r.percentage >= 40 ? 'Passed' : 'Failed'),
      answers: r.answers || [],
      startedAt: r.startedAt,
      submittedAt: r.submittedAt || r.createdAt,
      createdAt: r.createdAt
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("getAllResults error:", err);
    res.status(500).json({ error: "Failed to fetch results" });
  }
};

// ==================== SMART LEADERBOARD ====================
exports.getLeaderboard = async (req, res) => {
  try {
    const { examId } = req.query;

    let examDoc = null;
    let query = {};

    if (examId && examId !== 'all') {
      query.examId = examId;
      examDoc = await Exam.findById(examId);
    }

    // If a specific formal exam has rankings disabled:
    if (examDoc && examDoc.enableRankings === false) {
      return res.status(200).json({
        success: true,
        rankingsEnabled: false,
        examTitle: examDoc.title || examDoc.examname,
        message: "Rankings are hidden for this formal examination by the instructor.",
        leaderboard: []
      });
    }

    const results = await Result.find(query)
      .populate("studentId", "name username email role profilePic")
      .populate("examId", "title examname examcode courseId enableRankings isPractice")
      .sort({ score: -1, percentage: -1, createdAt: 1 });

    // Deduplicate or rank students
    const rankedList = results.map((r, index) => {
      const studentObj = r.studentId || {};
      const totalAnswered = r.answers?.length || r.maxScore || 1;
      const correctCount = r.answers?.filter(a => a.correct)?.length ?? r.score;
      const accuracy = Math.min(100, Math.round((correctCount / totalAnswered) * 100)) || r.percentage || 0;

      // Time taken in minutes
      let durationMinutes = 0;
      if (r.startedAt && r.submittedAt) {
        durationMinutes = Math.max(1, Math.round((new Date(r.submittedAt) - new Date(r.startedAt)) / 60000));
      }

      return {
        _id: r._id,
        rank: index + 1,
        studentId: studentObj._id || r.studentId,
        studentName: studentObj.name || studentObj.username || 'Student',
        studentEmail: studentObj.email || '',
        studentAvatar: studentObj.profilePic || 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
        examId: r.examId?._id || r.examId,
        examTitle: r.examId?.title || r.examId?.examname || 'General Exam',
        score: r.score,
        maxScore: r.maxScore,
        percentage: r.percentage || (r.maxScore > 0 ? Math.round((r.score / r.maxScore) * 100) : 0),
        status: r.status || (r.percentage >= 40 ? 'Passed' : 'Failed'),
        accuracy,
        timeTakenMinutes: durationMinutes,
        date: r.submittedAt || r.createdAt
      };
    });

    res.status(200).json({
      success: true,
      rankingsEnabled: true,
      totalParticipants: rankedList.length,
      examTitle: examDoc?.title || 'All Examinations',
      leaderboard: rankedList
    });
  } catch (error) {
    console.error("getLeaderboard error:", error);
    res.status(500).json({ error: "Failed to generate smart leaderboard" });
  }
};

// ==================== TOGGLE EXAM LEADERBOARD RANKINGS ====================
exports.toggleExamRankings = async (req, res) => {
  try {
    const { id } = req.params;
    const { enableRankings } = req.body;

    const exam = await Exam.findByIdAndUpdate(
      id,
      { enableRankings: enableRankings !== undefined ? enableRankings : true },
      { new: true }
    );

    if (!exam) return res.status(404).json({ error: "Exam not found" });

    await logActivity({
      action: 'Leaderboard Setting Changed',
      details: `Rankings ${exam.enableRankings ? 'ENABLED' : 'DISABLED'} for exam "${exam.title || exam.examname}"`,
      type: 'exam',
      user: 'Instructor/Admin',
      role: 'teacher'
    });

    res.status(200).json({
      success: true,
      message: `Leaderboard rankings ${exam.enableRankings ? 'enabled' : 'disabled'} successfully.`,
      exam
    });
  } catch (error) {
    console.error("toggleExamRankings error:", error);
    res.status(500).json({ error: "Failed to update ranking settings" });
  }
};

// ==================== GET RESULT BY RESULT ID ====================
exports.getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id)
      .populate("studentId", "name username email role profilePic")
      .populate("examId", "title examname totalMarks durationMinutes")
      .populate("answers.questionId", "questionText options correctAnswer");

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.status(200).json({
      ...result.toObject(),
      student: result.studentId,
      exam: result.examId,
      percentage: result.percentage || (result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0),
      status: result.status || (result.percentage >= 40 ? 'Passed' : 'Failed')
    });
  } catch (err) {
    console.error("getResultById error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ==================== GET RESULTS BY STUDENT ID ====================
exports.getResultsByStudentId = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    let query = {};

    if (studentId && studentId !== 'all' && studentId !== 'undefined' && studentId !== 'null') {
      if (mongoose.isValidObjectId(studentId)) {
        query = { studentId };
      } else {
        const u = await User.findOne({ $or: [{ email: studentId }, { username: studentId }] });
        if (u) {
          query = { studentId: u._id };
        }
      }
    }

    let results = await Result.find(query)
      .populate("studentId", "name username email role profilePic")
      .populate("examId", "title examname examcode totalMarks durationMinutes enableRankings isPractice")
      .sort({ createdAt: -1 });

    // Fallback: If no results found with specific query and a studentId was provided, check if any results exist for student role
    if (results.length === 0 && studentId && studentId !== 'all') {
      const studentUser = await User.findOne({ role: 'student' });
      if (studentUser && String(studentUser._id) !== String(query.studentId)) {
        const fallbackResults = await Result.find({ studentId: studentUser._id })
          .populate("studentId", "name username email role profilePic")
          .populate("examId", "title examname examcode totalMarks durationMinutes enableRankings isPractice")
          .sort({ createdAt: -1 });
        if (fallbackResults.length > 0) {
          results = fallbackResults;
        }
      }
    }

    const formatted = results.map(r => ({
      _id: r._id,
      student: r.studentId,
      studentId: r.studentId,
      exam: r.examId,
      examId: r.examId,
      score: r.score,
      maxScore: r.maxScore,
      percentage: r.percentage || (r.maxScore > 0 ? Math.round((r.score / r.maxScore) * 100) : 0),
      status: r.status || (r.percentage >= 40 ? 'Passed' : 'Failed'),
      answers: r.answers || [],
      startedAt: r.startedAt,
      submittedAt: r.submittedAt || r.createdAt,
      createdAt: r.createdAt
    }));

    res.status(200).json({
      success: true,
      results: formatted,
    });

  } catch (err) {
    console.error("getResultsByStudentId error:", err);
    res.status(500).json({ error: "Failed to fetch student results" });
  }
};

// ==================== CREATE RESULT ====================
exports.createResult = async (req, res) => {
  try {
    const newResult = new Result(req.body);
    await newResult.save();
    
    const populated = await Result.findById(newResult._id)
      .populate("studentId", "name username email profilePic")
      .populate("examId", "title examname examcode");

    const { emitRealtimeEvent } = require('../utils/socketEmitter');
    emitRealtimeEvent('resultCreated', populated);
    emitRealtimeEvent('examSubmitted', {
      examId: populated?.examId?._id || populated?.examId,
      studentId: populated?.studentId?._id || populated?.studentId,
      score: populated?.score,
      maxScore: populated?.maxScore,
      percentage: populated?.percentage
    });

    res.status(201).json(populated);
  } catch (err) {
    console.error("createResult error:", err);
    res.status(400).json({ error: err.message });
  }
};

// ==================== UPDATE RESULT ====================
exports.updateResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, maxScore } = req.body;

    const updateData = { ...req.body };
    if (score !== undefined && maxScore !== undefined && maxScore > 0) {
      updateData.percentage = Math.round((Number(score) / Number(maxScore)) * 100);
    }

    const update = await Result.findByIdAndUpdate(id, updateData, { new: true })
      .populate("studentId", "name username email profilePic")
      .populate("examId", "title examname examcode");

    if (!update) {
      return res.status(404).json({ error: "Result not found" });
    }

    await logActivity({
      action: 'Marks Updated',
      details: `Updated marks for Result ID: ${id} to Score: ${update.score}`,
      type: 'result',
      user: 'Teacher/Admin',
      role: 'admin'
    });

    const { emitRealtimeEvent } = require('../utils/socketEmitter');
    emitRealtimeEvent('resultUpdated', update);

    res.status(200).json(update);
  } catch (err) {
    console.error("updateResult error:", err);
    res.status(400).json({ error: "Failed to update result" });
  }
};

// ==================== DELETE RESULT ====================
exports.deleteResult = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Result.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Result not found" });
    }

    await logActivity({
      action: 'Result Deleted',
      details: `Deleted result record ID: ${id}`,
      type: 'result',
      user: 'Admin',
      role: 'admin'
    });

    const { emitRealtimeEvent } = require('../utils/socketEmitter');
    emitRealtimeEvent('resultDeleted', { resultId: id });

    res.status(200).json({ message: "Result deleted successfully" });
  } catch (err) {
    console.error("deleteResult error:", err);
    res.status(400).json({ error: "Failed to delete result" });
  }
};