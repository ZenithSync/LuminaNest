const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');
const QuizAttempt = require('../models/QuizAttempt');
const auth = require('../middleware/auth');

// Ensure uploads dir exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|mp4|webm|mov|avi|pdf|ppt|pptx|doc|docx/;
    const extname = allowed.test(path.extname(file.originalname).toLowerCase());
    if (extname) cb(null, true);
    else cb(new Error('Invalid file type'));
  }
});

// Middleware: must be instructor
const instructorOnly = (req, res, next) => {
  if (req.user.role !== 'instructor') return res.status(403).json({ message: 'Instructors only' });
  next();
};

// Create course
router.post('/courses', auth, instructorOnly, async (req, res) => {
  try {
    const { title, description, category, level, duration, tags, xpReward } = req.body;
    const course = await Course.create({
      title, description, category, level, duration,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      xpReward: xpReward || 100,
      instructor: req.user._id,
      instructorName: req.user.name,
      isPublished: false,
      lessons: []
    });
    await User.findByIdAndUpdate(req.user._id, { $push: { createdCourses: course._id } });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Upload content file for a lesson
router.post('/courses/:id/lessons/:lessonIndex/upload', auth, instructorOnly, upload.single('content'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const fileUrl = `/uploads/${req.file.filename}`;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let contentType = 'text';
    if (['.mp4', '.webm', '.mov', '.avi'].includes(ext)) contentType = 'video';
    else if (['.ppt', '.pptx'].includes(ext)) contentType = 'ppt';
    else if (['.pdf'].includes(ext)) contentType = 'pdf';

    res.json({ url: fileUrl, contentType, originalName: req.file.originalname });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add lesson to course
router.post('/courses/:id/lessons', auth, instructorOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your course' });

    const { title, content, contentType, contentUrl, duration, quiz } = req.body;
    const order = course.lessons.length + 1;
    course.lessons.push({
      title, content: content || '', contentType: contentType || 'text',
      contentUrl: contentUrl || '', duration: duration || 0, order,
      quiz: quiz || [], passingScore: 70
    });
    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update lesson quiz
router.put('/courses/:id/lessons/:lessonIndex/quiz', auth, instructorOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your course' });

    const { quiz, passingScore } = req.body;
    const idx = parseInt(req.params.lessonIndex);
    course.lessons[idx].quiz = quiz;
    course.lessons[idx].passingScore = passingScore || 70;
    await course.save();
    res.json({ message: 'Quiz updated', lesson: course.lessons[idx] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Publish/unpublish course
router.put('/courses/:id/publish', auth, instructorOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your course' });
    course.isPublished = !course.isPublished;
    await course.save();
    res.json({ isPublished: course.isPublished });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get instructor's courses
router.get('/courses', auth, instructorOnly, async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Instructor dashboard stats
router.get('/dashboard', auth, instructorOnly, async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id });
    const courseIds = courses.map(c => c._id);
    const enrollments = await Progress.countDocuments({ course: { $in: courseIds } });
    const completions = await Progress.countDocuments({ course: { $in: courseIds }, isCompleted: true });
    const quizAttempts = await QuizAttempt.countDocuments({ course: { $in: courseIds } });
    const passedAttempts = await QuizAttempt.countDocuments({ course: { $in: courseIds }, passed: true });
    const passRate = quizAttempts > 0 ? Math.round((passedAttempts / quizAttempts) * 100) : 0;

    // Recent student activity
    const recentEnrollments = await Progress.find({ course: { $in: courseIds } })
      .sort({ startedAt: -1 }).limit(5)
      .populate('user', 'name email')
      .populate('course', 'title');

    // XP leaderboard of MY students
    const myStudentIds = await Progress.distinct('user', { course: { $in: courseIds } });
    const myStudents = await User.find({ _id: { $in: myStudentIds } }, 'name xp level streak quizzesTaken').sort({ xp: -1 }).limit(10);

    res.json({
      name: req.user.name,
      totalCourses: courses.length,
      publishedCourses: courses.filter(c => c.isPublished).length,
      totalStudents: enrollments,
      completionRate: enrollments > 0 ? Math.round((completions / enrollments) * 100) : 0,
      quizPassRate: passRate,
      courses: courses.slice(0, 5),
      recentActivity: recentEnrollments,
      topStudents: myStudents,
      xp: req.user.xp,
      level: req.user.calculateLevel()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single course (instructor view with full lesson data)
router.get('/courses/:id', auth, instructorOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your course' });

    const enrollments = await Progress.countDocuments({ course: course._id });
    const completions = await Progress.countDocuments({ course: course._id, isCompleted: true });
    res.json({ course, enrollments, completions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete lesson
router.delete('/courses/:id/lessons/:lessonIndex', auth, instructorOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your course' });
    course.lessons.splice(parseInt(req.params.lessonIndex), 1);
    // Re-order
    course.lessons.forEach((l, i) => { l.order = i + 1; });
    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
