const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lessonIndex: { type: Number, required: true },
  answers: [Number], // user's selected option indexes
  score: { type: Number, default: 0 }, // percentage
  rawScore: { type: Number, default: 0 }, // points earned
  maxScore: { type: Number, default: 0 }, // max possible points
  passed: { type: Boolean, default: false },
  timeTaken: { type: Number, default: 0 }, // seconds
  xpEarned: { type: Number, default: 0 },
  attemptNumber: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
