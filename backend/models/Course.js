const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: Number, required: true }, // index of correct option
  explanation: { type: String, default: '' },
  points: { type: Number, default: 10 }
});

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  contentType: { type: String, enum: ['text', 'video', 'ppt', 'pdf', 'youtube'], default: 'text' },
  contentUrl: { type: String, default: '' }, // file path or youtube URL
  duration: { type: Number, default: 0 }, // minutes
  order: { type: Number, required: true },
  quiz: [quizQuestionSchema], // MCQ quiz after lesson
  passingScore: { type: Number, default: 70 } // % to pass
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  category: { type: String, default: 'General' },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  instructorName: { type: String },
  duration: { type: String, default: '' },
  lessons: [lessonSchema],
  enrolledCount: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  isPublished: { type: Boolean, default: false },
  tags: [String],
  xpReward: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);
