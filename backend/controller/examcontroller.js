// backend/controller/examcontroller.js
const mongoose = require('mongoose');
const Exam = require('../models/exam');
const Question = require('../models/Question');
const Result = require('../models/result');
const Course = require('../models/Course');
const User = require('../models/user');
const { logActivity } = require('./activitycontroller');

// ==================== LIST ALL EXAMS ====================
exports.listExams = async (req, res) => {
  try {
    const filter = {};
    if (req.query.courseId) filter.courseId = req.query.courseId;

    const exams = await Exam.find(filter)
      .populate('courseId', 'name duration')
      .populate('createdBy', 'name username email')
      .sort({ createdAt: -1 });

    // Format exams to provide backward compatibility for frontend property names
    const formatted = exams.map(e => ({
      _id: e._id,
      id: e._id,
      title: e.title || e.examname,
      examname: e.examname || e.title,
      examcode: e.examcode || '',
      courseId: e.courseId,
      course: e.courseId, // backwards compatibility
      durationMinutes: e.durationMinutes,
      duration: e.durationMinutes,
      totalMarks: e.totalMarks || (e.questionIds ? e.questionIds.length : 0),
      passMarks: e.passMarks,
      questionIds: e.questionIds || [],
      questionCount: e.questionIds ? e.questionIds.length : 0,
      date: e.date,
      starttime: e.starttime,
      createdAt: e.createdAt
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    console.error('listExams error:', err);
    return res.status(500).json({ error: 'Server error fetching exams' });
  }
};

// ==================== GET SINGLE EXAM ====================
exports.getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('courseId', 'name duration')
      .populate('questionIds');

    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    return res.status(200).json(exam);
  } catch (err) {
    console.error('getExam error:', err);
    return res.status(500).json({ error: 'Server error fetching exam' });
  }
};

// ==================== GET EXAM BY ACCESS CODE / QR ====================
exports.getExamByCode = async (req, res) => {
  try {
    const rawCode = String(req.params.code || '').trim();
    if (!rawCode) return res.status(400).json({ error: 'Exam access code is required' });

    // Look up case-insensitively by examcode or examCode or _id
    let exam = await Exam.findOne({
      $or: [
        { examcode: { $regex: new RegExp(`^${rawCode}$`, 'i') } },
        { examCode: { $regex: new RegExp(`^${rawCode}$`, 'i') } }
      ]
    }).populate('courseId', 'name duration');

    if (!exam && rawCode.length === 24) {
      try {
        exam = await Exam.findById(rawCode).populate('courseId', 'name duration');
      } catch (e) {}
    }

    if (!exam) {
      return res.status(404).json({ error: `No active exam found for access code: "${rawCode}"` });
    }

    return res.status(200).json({
      success: true,
      exam: {
        _id: exam._id,
        id: exam._id,
        title: exam.title || exam.examname,
        examname: exam.examname || exam.title,
        examcode: exam.examcode || exam.examCode,
        course: exam.courseId,
        durationMinutes: exam.durationMinutes,
        questionCount: exam.questionIds?.length || 0,
        enableRankings: exam.enableRankings,
        securityLevel: exam.securityLevel || 'strict'
      }
    });
  } catch (err) {
    console.error('getExamByCode error:', err);
    return res.status(500).json({ error: 'Server error looking up exam code' });
  }
};

// ==================== CREATE EXAM ====================
exports.createExam = async (req, res) => {
  try {
    const {
      title,
      examname,
      examcode,
      courseId,
      course,
      questionIds,
      durationMinutes,
      duration,
      totalMarks,
      passMarks,
      date,
      starttime,
      createdBy
    } = req.body;

    const finalTitle = title || examname;
    const finalCourseId = courseId || course;
    const finalDuration = durationMinutes || duration || 30;

    if (!finalTitle || !finalCourseId) {
      return res.status(400).json({ error: 'Title/exam name and course are required' });
    }

    const cleanQuestionIds = Array.isArray(questionIds) ? questionIds : [];

    const exam = await Exam.create({
      title: finalTitle,
      examname: finalTitle,
      examcode: examcode || `EXAM-${Date.now().toString().slice(-4)}`,
      courseId: finalCourseId,
      questionIds: cleanQuestionIds,
      durationMinutes: Number(finalDuration),
      totalMarks: totalMarks ? Number(totalMarks) : cleanQuestionIds.length,
      passMarks: passMarks ? Number(passMarks) : Math.ceil(cleanQuestionIds.length * 0.4),
      date: date || new Date().toISOString().split('T')[0],
      starttime: starttime || '10:00 AM',
      createdBy: createdBy || undefined
    });

    const populatedExam = await Exam.findById(exam._id).populate('courseId', 'name');

    // Log activity in MongoDB
    await logActivity({
      action: 'Exam Created',
      details: `Created new exam: "${finalTitle}" with ${cleanQuestionIds.length} questions in course [${populatedExam.courseId?.name || 'General'}]`,
      type: 'exam',
      user: 'Teacher/Admin',
      role: 'teacher'
    });

    // Real-Time Push Notification across all active pages
    const { emitRealtimeEvent } = require('../utils/socketEmitter');
    emitRealtimeEvent('examCreated', populatedExam);

    return res.status(201).json(populatedExam);
  } catch (err) {
    console.error('createExam error:', err);
    return res.status(500).json({ error: 'Server error creating exam: ' + err.message });
  }
};

// ==================== START EXAM ====================
exports.startExam = async (req, res) => {
  try {
    const examId = req.params.id;
    const exam = await Exam.findById(examId).populate('courseId', 'name duration');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found in database' });
    }

    // Fetch questions from MongoDB matching questionIds, excluding correctAnswer for security
    let questions = [];
    if (exam.questionIds && exam.questionIds.length > 0) {
      questions = await Question.find({ _id: { $in: exam.questionIds } })
        .select('-correctAnswer')
        .lean();
    } else if (exam.courseId) {
      // Fallback: If no explicit questionIds, grab questions belonging to the course
      questions = await Question.find({ courseId: exam.courseId._id || exam.courseId })
        .select('-correctAnswer')
        .limit(20)
        .lean();
    }

    const resultId = `res_${Date.now()}`;

    // Optional student activity log
    const studentId = req.query.studentId || req.body?.studentId;
    if (studentId) {
      const studentDoc = await User.findById(studentId);
      if (studentDoc) {
        await logActivity({
          action: 'Exam Started',
          details: `Student "${studentDoc.name || studentDoc.username}" started exam: "${exam.title}"`,
          type: 'exam',
          user: studentDoc.name || studentDoc.username,
          userId: studentDoc._id,
          role: 'student'
        });
      }
    }

    return res.status(200).json({
      exam: {
        _id: exam._id,
        id: exam._id,
        title: exam.title,
        examname: exam.title,
        course: exam.courseId,
        durationMinutes: exam.durationMinutes,
        totalMarks: questions.length
      },
      questions,
      resultId
    });
  } catch (err) {
    console.error('startExam error:', err);
    return res.status(500).json({ message: 'Server error starting exam' });
  }
};

// ==================== SUBMIT EXAM ====================
exports.submitExam = async (req, res) => {
  try {
    const examId = req.params.id;
    const { studentId, answers, startedAt } = req.body || {};

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Fetch questions from MongoDB to evaluate correct answers
    let questionDocs = [];
    if (exam.questionIds && exam.questionIds.length > 0) {
      questionDocs = await Question.find({ _id: { $in: exam.questionIds } }).lean();
    } else {
      questionDocs = await Question.find({ courseId: exam.courseId }).lean();
    }

    // Build question map for instant answer grading
    const questionMap = {};
    questionDocs.forEach(q => {
      questionMap[q._id.toString()] = q;
    });

    let score = 0;
    const maxScore = questionDocs.length || (Array.isArray(answers) ? answers.length : 0);

    const evaluatedAnswers = (Array.isArray(answers) ? answers : []).map(a => {
      const qDoc = questionMap[String(a.questionId)];
      const isCorrect = qDoc && String(qDoc.correctAnswer).trim().toLowerCase() === String(a.selectedOption).trim().toLowerCase();
      if (isCorrect) score += 1;
      return {
        questionId: mongoose.isValidObjectId(a.questionId) ? a.questionId : undefined,
        questionText: qDoc?.questionText || a.questionText || '',
        selectedOption: String(a.selectedOption || ''),
        correctAnswer: qDoc?.correctAnswer || '',
        correct: !!isCorrect
      };
    });

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const status = percentage >= 40 ? 'Passed' : 'Failed';

    // Resolve student user safely without throwing CastError
    let userDoc = null;
    if (studentId && mongoose.isValidObjectId(studentId)) {
      try {
        userDoc = await User.findById(studentId);
      } catch (e) {}
    }
    if (!userDoc && studentId) {
      try {
        userDoc = await User.findOne({ $or: [{ email: studentId }, { username: studentId }] });
      } catch (e) {}
    }
    if (!userDoc) {
      userDoc = await User.findOne({ role: 'student' }) || await User.findOne();
    }
    if (!userDoc) {
      userDoc = await User.create({
        name: 'Student User',
        username: 'student',
        email: 'student@exam.com',
        role: 'student',
        password: 'studentpassword'
      });
    }

    // Save Result permanently in MongoDB
    let savedResult = null;
    if (userDoc) {
      savedResult = await Result.create({
        studentId: userDoc._id,
        examId: exam._id,
        answers: evaluatedAnswers,
        score,
        maxScore,
        percentage,
        status,
        startedAt: startedAt ? new Date(startedAt) : new Date(Date.now() - (exam.durationMinutes || 30) * 60000),
        submittedAt: new Date()
      });

      const populatedResult = await Result.findById(savedResult._id)
        .populate("studentId", "name username email profilePic role")
        .populate("examId", "title examname examcode totalMarks durationMinutes");

      // Log activity in MongoDB
      await logActivity({
        action: 'Exam Submitted',
        details: `Student "${userDoc.name || userDoc.username || userDoc.email}" submitted exam "${exam.title}" - Score: ${score}/${maxScore} (${percentage}% - ${status})`,
        type: 'result',
        user: userDoc.name || userDoc.username || userDoc.email,
        userId: userDoc._id,
        role: 'student'
      });

      const { emitRealtimeEvent } = require('../utils/socketEmitter');
      emitRealtimeEvent('examSubmitted', { 
        examId: exam._id, 
        score, 
        maxScore, 
        percentage, 
        status,
        studentId: userDoc._id,
        resultId: savedResult._id 
      });
      emitRealtimeEvent('resultCreated', populatedResult);
    }

    return res.status(200).json({
      success: true,
      score,
      maxScore,
      percentage,
      status,
      studentId: userDoc ? userDoc._id : studentId,
      resultId: savedResult ? savedResult._id : `result_${Date.now()}`,
      result: savedResult
    });
  } catch (err) {
    console.error('submitExam error:', err);
    return res.status(500).json({ error: 'Server error submitting exam: ' + err.message });
  }
};

// ==================== UPDATE EXAM ====================
exports.updateExam = async (req, res) => {
  try {
    const {
      title,
      examname,
      examcode,
      examCode,
      courseId,
      course,
      questionIds,
      durationMinutes,
      duration,
      timeLimit,
      totalMarks,
      passMarks,
      date,
      starttime,
      securityLevel,
      enableRankings,
      isPractice
    } = req.body;

    const updateData = {};
    if (title || examname) {
      updateData.title = title || examname;
      updateData.examname = title || examname;
    }
    if (examcode || examCode) {
      updateData.examcode = examcode || examCode;
      updateData.examCode = examcode || examCode;
    }
    if (courseId || course) {
      updateData.courseId = courseId || course;
    }
    if (Array.isArray(questionIds)) {
      updateData.questionIds = questionIds;
      updateData.totalMarks = totalMarks ? Number(totalMarks) : questionIds.length;
    }

    // Flexible duration parsing
    const rawDuration = durationMinutes !== undefined ? durationMinutes : (duration !== undefined ? duration : timeLimit);
    if (rawDuration !== undefined && rawDuration !== null && !isNaN(Number(rawDuration))) {
      updateData.durationMinutes = Math.max(1, Number(rawDuration));
    }

    if (passMarks !== undefined && passMarks !== null && !isNaN(Number(passMarks))) {
      updateData.passMarks = Number(passMarks);
    }
    if (totalMarks !== undefined && totalMarks !== null && !isNaN(Number(totalMarks))) {
      updateData.totalMarks = Number(totalMarks);
    }
    if (date) updateData.date = date;
    if (starttime) updateData.starttime = starttime;
    if (securityLevel) updateData.securityLevel = securityLevel;
    if (enableRankings !== undefined) updateData.enableRankings = enableRankings;
    if (isPractice !== undefined) updateData.isPractice = isPractice;

    const updated = await Exam.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('courseId', 'name duration').populate('questionIds');

    if (!updated) return res.status(404).json({ error: 'Exam not found' });

    await logActivity({
      action: 'Exam Updated',
      details: `Updated exam "${updated.title}" - Duration: ${updated.durationMinutes} Mins, Questions: ${updated.questionIds?.length || 0}`,
      type: 'exam',
      user: 'Teacher/Admin',
      role: 'teacher'
    });

    const { emitRealtimeEvent } = require('../utils/socketEmitter');
    emitRealtimeEvent('examUpdated', {
      _id: updated._id,
      id: updated._id,
      title: updated.title,
      examname: updated.examname,
      durationMinutes: updated.durationMinutes,
      duration: updated.durationMinutes,
      totalMarks: updated.totalMarks,
      passMarks: updated.passMarks,
      questionIds: updated.questionIds,
      questionCount: updated.questionIds?.length || 0,
      courseId: updated.courseId,
      course: updated.courseId,
      date: updated.date,
      starttime: updated.starttime
    });

    return res.status(200).json(updated);
  } catch (err) {
    console.error('updateExam error:', err);
    return res.status(500).json({ error: 'Server error updating exam: ' + err.message });
  }
};

// ==================== ADD QUESTIONS TO EXISTING EXAM ====================
exports.addQuestionsToExam = async (req, res) => {
  try {
    const { questionIds, questionId } = req.body;
    const toAdd = questionIds || (questionId ? [questionId] : []);

    if (!Array.isArray(toAdd) || toAdd.length === 0) {
      return res.status(400).json({ error: 'questionIds array or questionId is required' });
    }

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    const currentSet = new Set((exam.questionIds || []).map(id => String(id)));
    toAdd.forEach(id => currentSet.add(String(id)));

    const updatedIds = Array.from(currentSet);
    exam.questionIds = updatedIds;
    exam.totalMarks = updatedIds.length;
    await exam.save();

    const populated = await Exam.findById(exam._id)
      .populate('courseId', 'name duration')
      .populate('questionIds');

    await logActivity({
      action: 'Questions Added to Exam',
      details: `Added ${toAdd.length} question(s) to exam "${exam.title}". Total: ${updatedIds.length}`,
      type: 'exam',
      user: 'Teacher',
      role: 'teacher'
    });

    const { emitRealtimeEvent } = require('../utils/socketEmitter');
    emitRealtimeEvent('examUpdated', populated);

    return res.status(200).json(populated);
  } catch (err) {
    console.error('addQuestionsToExam error:', err);
    return res.status(500).json({ error: 'Server error adding questions to exam: ' + err.message });
  }
};

// ==================== REMOVE QUESTION FROM EXAM ====================
exports.removeQuestionFromExam = async (req, res) => {
  try {
    const { questionId } = req.body;
    const targetQId = questionId || req.params.questionId;

    if (!targetQId) return res.status(400).json({ error: 'questionId is required' });

    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    exam.questionIds = (exam.questionIds || []).filter(id => String(id) !== String(targetQId));
    exam.totalMarks = exam.questionIds.length;
    await exam.save();

    const populated = await Exam.findById(exam._id)
      .populate('courseId', 'name duration')
      .populate('questionIds');

    const { emitRealtimeEvent } = require('../utils/socketEmitter');
    emitRealtimeEvent('examUpdated', populated);

    return res.status(200).json(populated);
  } catch (err) {
    console.error('removeQuestionFromExam error:', err);
    return res.status(500).json({ error: 'Server error removing question: ' + err.message });
  }
};

// ==================== DELETE EXAM ====================
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    await logActivity({
      action: 'Exam Deleted',
      details: `Deleted exam: "${exam.title}"`,
      type: 'exam',
      user: 'Admin',
      role: 'admin'
    });

    const { emitRealtimeEvent } = require('../utils/socketEmitter');
    emitRealtimeEvent('examDeleted', { examId: req.params.id, title: exam.title });

    return res.status(200).json({ success: true, message: 'Exam deleted successfully' });
  } catch (err) {
    console.error('deleteExam error:', err);
    return res.status(500).json({ error: 'Server error deleting exam' });
  }
};