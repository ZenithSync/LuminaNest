const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema({
  lessonIndex: Number,
  completed: { type: Boolean, default: false },
  quizPassed: { type: Boolean, default: false },
  quizScore: { type: Number, default: 0 },
  quizAttempts: { type: Number, default: 0 },
  completedAt: Date
});

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lessonProgress: [lessonProgressSchema],
  completedLessons: [Number],
  percentComplete: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  totalXpEarned: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date
});

module.exports = mongoose.model('Progress', progressSchema);
