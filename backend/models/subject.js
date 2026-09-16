const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectname: { type: String, required: true, unique: true },
  subjectcode: { type: String, required: true, unique: true },
  description: { type: String },
  credits: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  difficulty: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);