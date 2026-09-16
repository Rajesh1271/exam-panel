const Activity = require('../models/Activity');

// Helper function to easily log activities across the backend
const logActivity = async ({ action, details, type = 'system', user = 'System', userId = null, role = 'system' }) => {
  try {
    const activity = await Activity.create({
      action,
      details,
      type,
      user: user || 'Anonymous',
      userId: userId || null,
      role: role || 'system',
      timestamp: new Date()
    });
    return activity;
  } catch (err) {
    console.error('Failed to log activity:', err.message);
    return null;
  }
};

// GET all activities with filtering and pagination
exports.getActivities = async (req, res) => {
  try {
    const { type, role, limit = 50, page = 1, search } = req.query;
    const filter = {};

    if (type && type !== 'all') {
      filter.type = type;
    }
    if (role && role !== 'all') {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { action: { $regex: search, $options: 'i' } },
        { details: { $regex: search, $options: 'i' } },
        { user: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Activity.countDocuments(filter);
    const activities = await Activity.find(filter)
      .sort({ timestamp: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      activities
    });
  } catch (err) {
    console.error('getActivities error:', err);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

// GET recent activities for dashboard
exports.getRecentActivities = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const activities = await Activity.find()
      .sort({ timestamp: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      activities
    });
  } catch (err) {
    console.error('getRecentActivities error:', err);
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
};

// GET activity summary stats
exports.getActivityStats = async (req, res) => {
  try {
    const totalActivities = await Activity.countDocuments();
    const authActivities = await Activity.countDocuments({ type: 'auth' });
    const questionActivities = await Activity.countDocuments({ type: 'question' });
    const examActivities = await Activity.countDocuments({ type: 'exam' });
    const resultActivities = await Activity.countDocuments({ type: 'result' });
    const courseActivities = await Activity.countDocuments({ type: 'course' });

    res.status(200).json({
      totalActivities,
      authActivities,
      questionActivities,
      examActivities,
      resultActivities,
      courseActivities
    });
  } catch (err) {
    console.error('getActivityStats error:', err);
    res.status(500).json({ error: 'Failed to fetch activity stats' });
  }
};

// POST create custom activity (manual entry)
exports.createActivity = async (req, res) => {
  try {
    const { action, details, type, user, userId, role } = req.body;
    if (!action || !details) {
      return res.status(400).json({ error: 'Action and details are required' });
    }

    const newActivity = await logActivity({ action, details, type, user, userId, role });
    res.status(201).json(newActivity);
  } catch (err) {
    console.error('createActivity error:', err);
    res.status(500).json({ error: 'Failed to record activity' });
  }
};

// DELETE single activity
exports.deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Activity.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    res.status(200).json({ success: true, message: 'Activity deleted' });
  } catch (err) {
    console.error('deleteActivity error:', err);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
};

// DELETE clear all activities (Admin action)
exports.clearActivities = async (req, res) => {
  try {
    await Activity.deleteMany({});
    await logActivity({
      action: 'Activity Logs Cleared',
      details: 'All activity logs were cleared by Admin',
      type: 'system',
      user: 'Admin',
      role: 'admin'
    });
    res.status(200).json({ success: true, message: 'All activities cleared successfully' });
  } catch (err) {
    console.error('clearActivities error:', err);
    res.status(500).json({ error: 'Failed to clear activities' });
  }
};

exports.logActivity = logActivity;
