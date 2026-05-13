const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Global leaderboard (students + instructors compete!)
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({}, 'name xp level streak quizzesTaken role badges completedCourses')
      .populate('badges', 'icon name tier')
      .sort({ xp: -1 })
      .limit(50);

    const leaderboard = users.map((u, i) => ({
      rank: i + 1,
      id: u._id,
      name: u.name,
      xp: u.xp,
      level: u.level || 1,
      streak: u.streak,
      quizzesTaken: u.quizzesTaken,
      role: u.role,
      topBadge: u.badges?.slice(-1)[0] || null,
      badgeCount: u.badges?.length || 0,
      coursesCompleted: u.completedCourses?.length || 0
    }));

    // Update ranks in DB
    for (const entry of leaderboard) {
      await User.findByIdAndUpdate(entry.id, { rank: entry.rank });
    }

    const myRank = leaderboard.findIndex(u => u.id.toString() === req.user._id.toString()) + 1;
    res.json({ leaderboard, myRank });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Weekly leaderboard (by quizzes this week)
router.get('/weekly', auth, async (req, res) => {
  try {
    const QuizAttempt = require('../models/QuizAttempt');
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyScores = await QuizAttempt.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      { $group: { _id: '$user', weeklyXp: { $sum: '$xpEarned' }, quizzes: { $sum: 1 } } },
      { $sort: { weeklyXp: -1 } },
      { $limit: 20 }
    ]);

    const userIds = weeklyScores.map(s => s._id);
    const users = await User.find({ _id: { $in: userIds } }, 'name role xp level');

    const result = weeklyScores.map((s, i) => {
      const user = users.find(u => u._id.toString() === s._id.toString());
      return {
        rank: i + 1,
        name: user?.name || 'Unknown',
        role: user?.role || 'student',
        weeklyXp: s.weeklyXp,
        quizzes: s.quizzes,
        level: user?.level || 1
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
