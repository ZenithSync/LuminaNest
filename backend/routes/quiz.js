const express = require('express');
const router = express.Router();
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Badge = require('../models/Badge');
const auth = require('../middleware/auth');

// Submit quiz attempt
router.post('/submit', auth, async (req, res) => {
  try {
    const { courseId, lessonIndex, answers, timeTaken } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const lesson = course.lessons[lessonIndex];
    if (!lesson || !lesson.quiz || lesson.quiz.length === 0) {
      return res.status(400).json({ message: 'No quiz for this lesson' });
    }

    // Calculate score
    let rawScore = 0;
    let maxScore = 0;
    const results = lesson.quiz.map((q, i) => {
      maxScore += q.points;
      const correct = answers[i] === q.correctAnswer;
      if (correct) rawScore += q.points;
      return {
        question: q.question,
        selectedAnswer: answers[i],
        correctAnswer: q.correctAnswer,
        correct,
        explanation: q.explanation,
        options: q.options
      };
    });

    const scorePercent = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;
    const passed = scorePercent >= (lesson.passingScore || 70);

    // Count prior attempts
    const priorAttempts = await QuizAttempt.countDocuments({
      user: req.user._id, course: courseId, lessonIndex
    });

    // XP calculation — bonus for speed and first-try pass
    let xpEarned = 0;
    if (passed) {
      xpEarned = Math.round(rawScore * 0.5);
      if (priorAttempts === 0) xpEarned = Math.round(xpEarned * 1.5); // first try bonus
      if (timeTaken < 30) xpEarned = Math.round(xpEarned * 1.2); // speed bonus
      xpEarned = Math.max(5, xpEarned);
    } else {
      xpEarned = Math.round(rawScore * 0.1); // partial XP for effort
    }

    // Save attempt
    const attempt = await QuizAttempt.create({
      user: req.user._id,
      course: courseId,
      lessonIndex,
      answers,
      score: scorePercent,
      rawScore,
      maxScore,
      passed,
      timeTaken: timeTaken || 0,
      xpEarned,
      attemptNumber: priorAttempts + 1
    });

    // Update user XP and stats
    const user = await User.findById(req.user._id);
    user.xp += xpEarned;
    user.quizzesTaken += 1;
    user.totalScore += rawScore;
    user.level = user.calculateLevel();
    await user.save();

    // Update progress if passed
    let progress = await Progress.findOne({ user: req.user._id, course: courseId });
    if (progress && passed) {
      let lp = progress.lessonProgress.find(lp => lp.lessonIndex === lessonIndex);
      if (!lp) {
        progress.lessonProgress.push({ lessonIndex, quizPassed: true, quizScore: scorePercent, quizAttempts: 1 });
      } else {
        lp.quizPassed = true;
        lp.quizScore = Math.max(lp.quizScore, scorePercent);
        lp.quizAttempts += 1;
      }

      // Mark lesson complete only if quiz passed
      if (!progress.completedLessons.includes(lessonIndex)) {
        progress.completedLessons.push(lessonIndex);
      }
      progress.percentComplete = Math.round((progress.completedLessons.length / course.lessons.length) * 100);
      progress.totalXpEarned += xpEarned;

      if (progress.percentComplete === 100 && !progress.isCompleted) {
        progress.isCompleted = true;
        progress.completedAt = new Date();
        await User.findByIdAndUpdate(req.user._id, { $addToSet: { completedCourses: courseId } });
        // Extra XP for course completion
        await User.findByIdAndUpdate(req.user._id, { $inc: { xp: course.xpReward || 100 } });

        // Issue certificate
        const Certificate = require('../models/Certificate');
        const avgScore = Math.round(user.totalScore / Math.max(user.quizzesTaken, 1));
        let grade = 'Pass';
        if (scorePercent >= 90) grade = 'Distinction';
        else if (scorePercent >= 75) grade = 'Merit';

        const cert = await Certificate.create({
          user: req.user._id, course: courseId, grade, finalScore: scorePercent
        });
        await User.findByIdAndUpdate(req.user._id, { $addToSet: { certificates: cert._id } });
      }
      await progress.save();
    }

    // Check for new badges
    const updatedUser = await User.findById(req.user._id).populate('badges');
    const allBadges = await Badge.find();
    const earnedIds = updatedUser.badges.map(b => b._id.toString());
    const newBadges = [];

    for (const badge of allBadges) {
      if (earnedIds.includes(badge._id.toString())) continue;
      const rt = badge.requirement?.type;
      const rv = badge.requirement?.value;
      let earned = false;
      if (rt === 'xp' && updatedUser.xp >= rv) earned = true;
      if (rt === 'streak' && updatedUser.streak >= rv) earned = true;
      if (rt === 'coursesCompleted' && updatedUser.completedCourses.length >= rv) earned = true;
      if (rt === 'quizzesTaken' && updatedUser.quizzesTaken >= rv) earned = true;
      if (rt === 'level' && updatedUser.calculateLevel() >= rv) earned = true;
      if (earned) {
        updatedUser.badges.push(badge._id);
        updatedUser.xp += (badge.xpBonus || 0);
        newBadges.push(badge);
      }
    }
    if (newBadges.length) await updatedUser.save();

    res.json({
      results,
      score: scorePercent,
      rawScore,
      maxScore,
      passed,
      xpEarned,
      newBadges,
      newLevel: updatedUser.calculateLevel(),
      totalXp: updatedUser.xp,
      attemptNumber: priorAttempts + 1
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get quiz history for a lesson
router.get('/history/:courseId/:lessonIndex', auth, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      user: req.user._id,
      course: req.params.courseId,
      lessonIndex: parseInt(req.params.lessonIndex)
    }).sort({ createdAt: -1 });
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
