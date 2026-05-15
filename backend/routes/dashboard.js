const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Progress = require('../models/Progress');
const User = require('../models/User');
const Course = require('../models/Course');

// Student dashboard
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('badges', 'icon name tier rarity');
    const allProgress = await Progress.find({ user: req.user._id }).populate('course', 'title thumbnail instructor instructorName level category');
    const inProgress = allProgress.filter(p => !p.isCompleted);
    const completed = allProgress.filter(p => p.isCompleted);

    // Calculate next level XP threshold
    const xpThresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500];
    const currentLevel = user.calculateLevel();
    const currentLevelXp = xpThresholds[currentLevel - 1] || 0;
    const nextLevelXp = xpThresholds[currentLevel] || 7500;
    const xpProgress = Math.round(((user.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100);

    res.json({
      name: user.name,
      role: 'student',
      streak: user.streak,
      xp: user.xp,
      level: currentLevel,
      xpProgress: Math.min(100, Math.max(0, xpProgress)),
      currentLevelXp,
      nextLevelXp,
      totalCourses: allProgress.length,
      inProgress: inProgress.length,
      completed: completed.length,
      badges: user.badges,
      badgeCount: user.badges.length,
      rank: user.rank,
      quizzesTaken: user.quizzesTaken,
      enrolledCourses: allProgress.map(p => ({
        _id: p.course._id,
        title: p.course.title,
        thumbnail: p.course.thumbnail,
        instructorName: p.course.instructorName,
        level: p.course.level,
        category: p.course.category,
        percentComplete: p.percentComplete,
        isCompleted: p.isCompleted,
        totalXpEarned: p.totalXpEarned
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
