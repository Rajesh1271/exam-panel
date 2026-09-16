const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  examname: { type: String },
  examcode: { type: String, trim: true },
  examCode: { type: String, trim: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  durationMinutes: { type: Number, default: 30 },
  totalMarks: { type: Number, default: 0 },
  passMarks: { type: Number, default: 0 },
  enableRankings: { type: Boolean, default: true },
  isPractice: { type: Boolean, default: true },
  securityLevel: { type: String, enum: ['standard', 'strict', 'proctored'], default: 'strict' },
  date: { type: String },
  starttime: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Exam', examSchema);