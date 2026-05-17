const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all published courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
      .select('-lessons.quiz')
      .populate('instructor', 'name');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single course (with quiz for enrolled, without for others)
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name avatar bio');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const progress = await Progress.findOne({ user: req.user._id, course: course._id });
    const enrolled = !!progress;

    // Strip quiz answers from questions if not enrolled/instructor
    const courseObj = course.toObject();
    if (!enrolled && req.user.role === 'student') {
      courseObj.lessons = courseObj.lessons.map(l => ({ ...l, quiz: [] }));
    }

    res.json({ course: courseObj, progress, enrolled });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Enroll
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!course.isPublished) return res.status(400).json({ message: 'Course not published' });

    const existing = await Progress.findOne({ user: req.user._id, course: course._id });
    if (existing) return res.status(400).json({ message: 'Already enrolled' });

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { enrolledCourses: course._id } });
    await Course.findByIdAndUpdate(course._id, { $inc: { enrolledCount: 1 } });
    await Progress.create({ user: req.user._id, course: course._id });

    res.json({ message: 'Enrolled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed sample courses (dev)
router.post('/seed', auth, async (req, res) => {
  try {
    const instructorId = req.user._id;
    const existing = await Course.countDocuments({ instructor: instructorId });
    if (existing > 0) {
      await Course.updateMany({ instructor: instructorId }, { isPublished: true });
      return res.json({ message: 'Courses already exist, published them!' });
    }

    const courses = [
      {
        title: 'Full Stack Web Development', description: 'Master HTML, CSS, JavaScript, React, Node.js and MongoDB.',
        thumbnail: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=600',
        category: 'Programming', level: 'Beginner', duration: '24 hours',
        instructor: instructorId, instructorName: req.user.name, isPublished: true, xpReward: 200,
        lessons: [
          {
            title: 'HTML & CSS Basics', content: 'Learn the building blocks of every website.', contentType: 'text',
            duration: 45, order: 1,
            quiz: [
              { question: 'What does HTML stand for?', options: ['HyperText Markup Language', 'HighText Machine Language', 'Hyperlink and Text Markup Language', 'None'], correctAnswer: 0, explanation: 'HTML stands for HyperText Markup Language', points: 10 },
              { question: 'Which tag is used for a paragraph?', options: ['<para>', '<p>', '<pg>', '<paragraph>'], correctAnswer: 1, explanation: '<p> creates a paragraph element', points: 10 },
              { question: 'CSS stands for?', options: ['Cascading Style Sheets', 'Colorful Style Sheets', 'Computer Style Sheets', 'Creative Style Sheets'], correctAnswer: 0, explanation: 'CSS stands for Cascading Style Sheets', points: 10 }
            ], passingScore: 70
          },
          {
            title: 'JavaScript Fundamentals', content: 'Variables, functions, loops, and DOM manipulation.', contentType: 'text',
            duration: 60, order: 2,
            quiz: [
              { question: 'Which keyword declares a constant?', options: ['var', 'let', 'const', 'def'], correctAnswer: 2, explanation: 'const declares a block-scoped constant', points: 10 },
              { question: 'What does DOM stand for?', options: ['Document Object Model', 'Data Object Management', 'Display Object Model', 'Document Order Model'], correctAnswer: 0, explanation: 'DOM means Document Object Model', points: 10 }
            ], passingScore: 70
          }
        ]
      },
      {
        title: 'Python for Data Science', description: 'Learn Python, Pandas, NumPy and machine learning fundamentals.',
        thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600',
        category: 'Data Science', level: 'Intermediate', duration: '18 hours',
        instructor: instructorId, instructorName: req.user.name, isPublished: true, xpReward: 250,
        lessons: [
          {
            title: 'Python Basics', content: 'Variables, data types, loops and functions.', contentType: 'text',
            duration: 45, order: 1,
            quiz: [
              { question: 'Which is NOT a Python data type?', options: ['int', 'float', 'char', 'bool'], correctAnswer: 2, explanation: 'Python does not have a char type like C', points: 10 },
              { question: 'How do you start a function in Python?', options: ['function myFunc():', 'def myFunc():', 'func myFunc():', 'define myFunc():'], correctAnswer: 1, explanation: 'Python uses def keyword', points: 10 }
            ], passingScore: 70
          }
        ]
      }
    ];
    await Course.insertMany(courses);
    res.json({ message: 'Sample courses seeded!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
