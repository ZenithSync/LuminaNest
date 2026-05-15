const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'instructor'], default: 'student' },
  avatar: { type: String, default: '' },

  // Student fields
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  completedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  certificates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' }],
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
  rank: { type: Number, default: 0 },
  quizzesTaken: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },

  // Instructor fields
  createdCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  bio: { type: String, default: '' },
  expertise: [String],
  totalStudents: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

// Calculate level from XP
userSchema.methods.calculateLevel = function() {
  const xpThresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500];
  let level = 1;
  for (let i = 0; i < xpThresholds.length; i++) {
    if (this.xp >= xpThresholds[i]) level = i + 1;
  }
  return Math.min(level, 10);
};

module.exports = mongoose.model('User', userSchema);
