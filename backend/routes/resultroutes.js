const express = require("express");
const router = express.Router();
const resultCtrl = require("../controller/resultcontroller");


// Get all results
router.get("/", resultCtrl.getAllResults);

//  Student-wise results
router.get("/student/:studentId", resultCtrl.getResultsByStudentId);

// Leaderboard
router.get("/leaderboard", resultCtrl.getLeaderboard);

// Toggle rankings visibility on formal exams
router.put("/exam/:id/toggle-rankings", resultCtrl.toggleExamRankings);

// Get result by Result ID
router.get("/:id", resultCtrl.getResultById);

// Create new result
router.post("/", resultCtrl.createResult);

// Update result
router.put("/:id", resultCtrl.updateResult);
// Delete result
router.delete("/:id", resultCtrl.deleteResult);

module.exports = router;