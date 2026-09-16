const mongoose = require('mongoose');

const securityLogSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  studentName: {
    type: String,
    default: 'Anonymous Student'
  },
  studentEmail: {
    type: String,
    default: ''
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: false
  },
  examTitle: {
    type: String,
    default: 'General Exam'
  },
  eventType: {
    type: String,
    enum: [
      'tab_switch',
      'browser_minimize',
      'fullscreen_exit',
      'multiple_refresh',
      'copy_attempt',
      'paste_attempt',
      'right_click',
      'inactivity',
      'multiple_login',
      'unauthorized_device',
      'general_violation'
    ],
    required: true
  },
  details: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'warning'
  },
  riskLevel: {
    type: String,
    enum: ['normal', 'warning', 'high_risk'],
    default: 'warning'
  },
  riskScore: {
    type: Number,
    default: 10
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('SecurityLog', securityLogSchema);
