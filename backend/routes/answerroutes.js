const express = require('express');
const router = express.Router();
const { createanswer, getallanswers, updateanswer, deleteanswer, getAnswersByStudent } = require("../controller/answercontroller");
// Create a new answer
router.post('/', createanswer);
// Get all answers
router.get('/', getallanswers);
// Update an answer
router.put('/:id', updateanswer);
// Delete an answer
router.delete('/:id', deleteanswer);
// Get answers by student ID
router.get("/student/:studentId", getAnswersByStudent);


module.exports = router;

