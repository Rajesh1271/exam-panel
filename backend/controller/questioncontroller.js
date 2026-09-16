// controller/questioncontroller.js
const Question = require('../models/Question');
const Course = require('../models/Course');
const { logActivity } = require('./activitycontroller');

// ==================== CREATE ====================
exports.createQuestion = async (req, res) => {
  try {
    const { questionText, options, correctAnswer, courseId, difficulty, marks, createdBy } = req.body;

    if (!questionText || !options || !correctAnswer) {
      return res.status(400).json({ error: "Question text, options, and correct answer are required" });
    }

    const cleanOptions = Array.isArray(options) 
      ? options.map(o => String(o).trim()).filter(Boolean) 
      : [];

    if (cleanOptions.length < 2) {
      return res.status(400).json({ error: "At least 2 options are required" });
    }

    const q = await Question.create({
      questionText: String(questionText).trim(),
      options: cleanOptions,
      correctAnswer: String(correctAnswer).trim(),
      courseId: courseId || null,
      difficulty: difficulty || 'Medium',
      marks: Number(marks) || 1,
      createdBy: createdBy || 'Admin'
    });

    await q.populate('courseId', 'name duration');

    // Fetch course name for detailed activity log
    let courseName = q.courseId?.name || 'General';

    // Log activity in MongoDB
    await logActivity({
      action: 'Question Created',
      details: `Added new question: "${q.questionText.substring(0, 50)}${q.questionText.length > 50 ? '...' : ''}" in course [${courseName}]`,
      type: 'question',
      user: createdBy || 'Admin',
      role: createdBy === 'Teacher' ? 'teacher' : 'admin'
    });

    const { emitRealtimeEvent } = require('../utils/socketEmitter');
    emitRealtimeEvent('questionAdded', q);

    return res.status(201).json(q);
  } catch (err) {
    console.error("createQuestion error:", err);
    return res.status(500).json({ error: "Server error creating question: " + err.message });
  }
};

// ==================== BATCH CREATE (for suggestions / bulk add) ====================
exports.createBatchQuestions = async (req, res) => {
  try {
    const { questions, targetExamId, createdBy } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "Questions array is required" });
    }

    const docsToInsert = [];
    for (const q of questions) {
      const cleanOpts = Array.isArray(q.options) 
        ? q.options.map(o => String(o).trim()).filter(Boolean) 
        : [];
      if (q.questionText && cleanOpts.length >= 2 && q.correctAnswer) {
        docsToInsert.push({
          questionText: String(q.questionText).trim(),
          options: cleanOpts,
          correctAnswer: String(q.correctAnswer).trim(),
          courseId: q.courseId || null,
          difficulty: q.difficulty || 'Medium',
          marks: Number(q.marks) || 1,
          createdBy: createdBy || q.createdBy || 'Teacher'
        });
      }
    }

    if (docsToInsert.length === 0) {
      return res.status(400).json({ error: "No valid questions found in payload" });
    }

    const inserted = await Question.insertMany(docsToInsert);
    const insertedIds = inserted.map(d => d._id);

    // If targetExamId is provided, attach to exam immediately
    let updatedExam = null;
    if (targetExamId) {
      const Exam = require('../models/exam');
      const exam = await Exam.findById(targetExamId);
      if (exam) {
        const set = new Set((exam.questionIds || []).map(id => String(id)));
        insertedIds.forEach(id => set.add(String(id)));
        exam.questionIds = Array.from(set);
        exam.totalMarks = exam.questionIds.length;
        await exam.save();
        updatedExam = await Exam.findById(exam._id).populate('courseId', 'name duration').populate('questionIds');
      }
    }

    // Log activity in MongoDB
    await logActivity({
      action: 'Batch Questions Created',
      details: `Created ${inserted.length} question(s) via Smart Suggestions${updatedExam ? ` and attached to "${updatedExam.title}"` : ''}`,
      type: 'question',
      user: createdBy || 'Teacher',
      role: 'teacher'
    });

    const { emitRealtimeEvent } = require('../utils/socketEmitter');
    emitRealtimeEvent('questionAdded', { batchCount: inserted.length, questions: inserted });
    if (updatedExam) {
      emitRealtimeEvent('examUpdated', updatedExam);
    }

    return res.status(201).json({
      success: true,
      count: inserted.length,
      questions: inserted,
      exam: updatedExam
    });
  } catch (err) {
    console.error("createBatchQuestions error:", err);
    return res.status(500).json({ error: "Server error in batch question creation: " + err.message });
  }
};

// ==================== GET ALL (with optional filter) ====================
exports.getQuestions = async (req, res) => {
  try {
    const courseId = req.params.courseId || req.query.courseId;
    const search = req.query.search;
    const filter = {};

    if (courseId && courseId !== 'all') {
      filter.courseId = courseId;
    }

    if (search) {
      filter.questionText = { $regex: search, $options: 'i' };
    }

    const list = await Question.find(filter)
      .populate('courseId', 'name duration')
      .sort({ createdAt: -1 });

    return res.status(200).json(list);
  } catch (err) {
    console.error("getQuestions error:", err);
    return res.status(500).json({ error: "Server error fetching questions" });
  }
};

// ==================== GET SINGLE ====================
exports.getQuestion = async (req, res) => {
  try {
    const q = await Question.findById(req.params.id).populate('courseId', 'name');
    if (!q) return res.status(404).json({ error: "Question not found" });

    return res.status(200).json(q);
  } catch (err) {
    console.error("getQuestion error:", err);
    return res.status(500).json({ error: "Server error fetching question" });
  }
};

// ==================== UPDATE ====================
exports.updateQuestion = async (req, res) => {
  try {
    const { questionText, options, correctAnswer, courseId, difficulty, marks } = req.body;
    
    const updateData = {};
    if (questionText) updateData.questionText = String(questionText).trim();
    if (options && Array.isArray(options)) updateData.options = options.map(o => String(o).trim()).filter(Boolean);
    if (correctAnswer) updateData.correctAnswer = String(correctAnswer).trim();
    if (courseId !== undefined) updateData.courseId = courseId || null;
    if (difficulty) updateData.difficulty = difficulty;
    if (marks !== undefined) updateData.marks = Number(marks);

    const updated = await Question.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('courseId', 'name');

    if (!updated) return res.status(404).json({ error: "Question not found" });

    // Log activity in MongoDB
    await logActivity({
      action: 'Question Updated',
      details: `Updated question ID: ${req.params.id} ("${updated.questionText.substring(0, 40)}...")`,
      type: 'question',
      user: 'Admin',
      role: 'admin'
    });

    const { emitRealtimeEvent } = require('../utils/socketEmitter');
    emitRealtimeEvent('questionUpdated', updated);

    return res.status(200).json(updated);
  } catch (err) {
    console.error("updateQuestion error:", err);
    return res.status(500).json({ error: "Server error updating question" });
  }
};

// ==================== DELETE ====================
exports.deleteQuestion = async (req, res) => {
  try {
    const q = await Question.findByIdAndDelete(req.params.id);
    if (!q) return res.status(404).json({ error: "Question not found" });

    // Log activity in MongoDB
    await logActivity({
      action: 'Question Deleted',
      details: `Deleted question: "${q.questionText.substring(0, 50)}..."`,
      type: 'question',
      user: 'Admin',
      role: 'admin'
    });

    const { emitRealtimeEvent } = require('../utils/socketEmitter');
    emitRealtimeEvent('questionDeleted', { questionId: req.params.id });

    return res.status(200).json({ success: true, message: "Question deleted successfully from MongoDB" });
  } catch (err) {
    console.error("deleteQuestion error:", err);
    return res.status(500).json({ error: "Server error deleting question" });
  }
};