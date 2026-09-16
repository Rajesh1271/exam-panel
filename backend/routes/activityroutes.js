const express = require('express');
const router = express.Router();
const activityCtrl = require('../controller/activitycontroller');

// GET all activities (with filter/search/pagination)
router.get('/', activityCtrl.getActivities);

// GET recent activities
router.get('/recent', activityCtrl.getRecentActivities);

// GET activity stats
router.get('/stats', activityCtrl.getActivityStats);

// POST create custom activity
router.post('/', activityCtrl.createActivity);

// DELETE single activity
router.delete('/:id', activityCtrl.deleteActivity);

// DELETE clear all activities
router.delete('/clear/all', activityCtrl.clearActivities);

module.exports = router;
