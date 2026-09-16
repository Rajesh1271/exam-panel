const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: String,
    default: 'System'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  role: {
    type: String,
    enum: ['admin', 'teacher', 'student', 'system'],
    default: 'system'
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['auth', 'question', 'exam', 'course', 'result', 'user', 'system'],
    default: 'system'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
