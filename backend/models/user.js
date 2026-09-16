const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  profilePic: { type: String, default: '' }
}, { timestamps: true });

// Export model as 'User' and register alias if needed
const UserModel = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = UserModel;