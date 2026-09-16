const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  questionText: { type: String },
  selectedOption: { type: String },
  correctAnswer: { type: String },
  correct: { type: Boolean, default: false }
});

const resultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  answers: [answerSchema],
  score: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  status: { type: String, enum: ['Passed', 'Failed', 'Completed'], default: 'Completed' },
  startedAt: { type: Date },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Performance indexes for instant student & exam lookup
resultSchema.index({ studentId: 1, createdAt: -1 });
resultSchema.index({ examId: 1, createdAt: -1 });

module.exports = mongoose.model('Result', resultSchema);