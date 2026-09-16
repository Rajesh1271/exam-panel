const express = require('express');
const router = express.Router();
const { createsubject, getallsubjects, updatesubject, deletesubject } = require('../controller/subjectcontroller');
// create
router.post('/', createsubject);
// read all
router.get('/', getallsubjects);
// update
router.put('/:id', updatesubject);
// delete
router.delete('/:id', deletesubject);

module.exports = router;