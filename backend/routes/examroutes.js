const express = require('express');
const router = express.Router();
const examCtrl = require('../controller/examcontroller');

// List all exams from MongoDB
router.get('/', examCtrl.listExams);

// Create new exam in MongoDB
router.post('/', examCtrl.createExam);

// Get exam by access code (QR / Shortcode lookup)
router.get('/code/:code', examCtrl.getExamByCode);

// Get single exam
router.get('/:id', examCtrl.getExam);

// Start exam (fetch exam metadata + questions from MongoDB)
router.get('/:id/start', examCtrl.startExam);

// Update exam in MongoDB
router.put('/:id', examCtrl.updateExam);

// Add questions to existing exam
router.put('/:id/questions', examCtrl.addQuestionsToExam);

// Remove question from existing exam
router.delete('/:id/questions/:questionId', examCtrl.removeQuestionFromExam);
router.put('/:id/remove-question', examCtrl.removeQuestionFromExam);

// Submit exam answers (evaluates against MongoDB questions and saves result)
router.post('/:id/submit', examCtrl.submitExam);

// Delete exam from MongoDB
router.delete('/:id', examCtrl.deleteExam);

module.exports = router;
