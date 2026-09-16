const express = require('express');
const router = express.Router();
const questionController = require('../controller/questioncontroller');

// Create question in MongoDB
router.post('/', questionController.createQuestion);

// Batch create questions in MongoDB (with optional target exam attachment)
router.post('/batch', questionController.createBatchQuestions);

// Get all questions (optional ?courseId=... or ?search=...)
router.get('/', questionController.getQuestions);

// Get questions by course ID path parameter
router.get('/by-course/:courseId', questionController.getQuestions);

// Get single question by ID
router.get('/:id', questionController.getQuestion);

// Update question by ID
router.put('/:id', questionController.updateQuestion);

// Delete question by ID
router.delete('/:id', questionController.deleteQuestion);

module.exports = router;