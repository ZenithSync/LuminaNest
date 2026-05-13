const express = require('express');
const router = express.Router();
const Badge = require('../models/Badge');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all badges
router.get('/', async (req, res) => {
  try {
    const badges = await Badge.find().sort({ tier: 1 });
    res.json(badges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's badges
router.get('/mine', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('badges');
    res.json(user.badges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Award badge to user (internal helper — also exported)
const awardBadge = async (userId, badgeId) => {
  const user = await User.findById(userId);
  if (!user.badges.includes(badgeId)) {
    user.badges.push(badgeId);
    await user.save();
    return true;
  }
  return false;
};

// Check and auto-award eligible badges for a user
router.post('/check', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('badges');
    const allBadges = await Badge.find();
    const earnedIds = user.badges.map(b => b._id.toString());
    const newBadges = [];

    for (const badge of allBadges) {
      if (earnedIds.includes(badge._id.toString())) continue;
      const req_type = badge.requirement?.type;
      const req_val = badge.requirement?.value;
      let earned = false;

      if (req_type === 'xp' && user.xp >= req_val) earned = true;
      if (req_type === 'streak' && user.streak >= req_val) earned = true;
      if (req_type === 'coursesCompleted' && user.completedCourses.length >= req_val) earned = true;
      if (req_type === 'quizzesTaken' && user.quizzesTaken >= req_val) earned = true;
      if (req_type === 'level' && user.calculateLevel() >= req_val) earned = true;

      if (earned) {
        user.badges.push(badge._id);
        user.xp += (badge.xpBonus || 0);
        newBadges.push(badge);
      }
    }

    await user.save();
    res.json({ newBadges });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed badges
router.post('/seed', async (req, res) => {
  try {
    await Badge.deleteMany();
    const badges = [
      // Level badges
      { name: 'Beginner Spark', description: 'Reach 100 XP', icon: '⚡', tier: 'bronze', category: 'level', requirement: { type: 'xp', value: 100 }, xpBonus: 20, rarity: 'common' },
      { name: 'Rising Star', description: 'Reach 500 XP', icon: '🌟', tier: 'silver', category: 'level', requirement: { type: 'xp', value: 500 }, xpBonus: 50, rarity: 'rare' },
      { name: 'Knowledge Master', description: 'Reach 1500 XP', icon: '🧠', tier: 'gold', category: 'level', requirement: { type: 'xp', value: 1500 }, xpBonus: 100, rarity: 'epic' },
      { name: 'Grandmaster', description: 'Reach 5000 XP', icon: '👑', tier: 'platinum', category: 'level', requirement: { type: 'xp', value: 5000 }, xpBonus: 250, rarity: 'legendary' },

      // Quiz badges
      { name: 'Quiz Rookie', description: 'Complete your first quiz', icon: '📝', tier: 'bronze', category: 'quiz', requirement: { type: 'quizzesTaken', value: 1 }, xpBonus: 15, rarity: 'common' },
      { name: 'Quiz Warrior', description: 'Complete 10 quizzes', icon: '⚔️', tier: 'silver', category: 'quiz', requirement: { type: 'quizzesTaken', value: 10 }, xpBonus: 40, rarity: 'rare' },
      { name: 'Quiz Legend', description: 'Complete 50 quizzes', icon: '🏆', tier: 'gold', category: 'quiz', requirement: { type: 'quizzesTaken', value: 50 }, xpBonus: 150, rarity: 'epic' },

      // Streak badges
      { name: 'Consistent Learner', description: '7-day streak', icon: '🔥', tier: 'bronze', category: 'streak', requirement: { type: 'streak', value: 7 }, xpBonus: 30, rarity: 'common' },
      { name: 'Unstoppable', description: '30-day streak', icon: '💥', tier: 'gold', category: 'streak', requirement: { type: 'streak', value: 30 }, xpBonus: 120, rarity: 'epic' },

      // Course badges
      { name: 'Graduate', description: 'Complete your first course', icon: '🎓', tier: 'silver', category: 'course', requirement: { type: 'coursesCompleted', value: 1 }, xpBonus: 50, rarity: 'rare' },
      { name: 'Scholar', description: 'Complete 5 courses', icon: '📚', tier: 'gold', category: 'course', requirement: { type: 'coursesCompleted', value: 5 }, xpBonus: 150, rarity: 'epic' },

      // Special / competition
      { name: 'Top Competitor', description: 'Reach top 3 on leaderboard', icon: '🥇', tier: 'platinum', category: 'competition', requirement: { type: 'rank', value: 3 }, xpBonus: 200, rarity: 'legendary' },
      { name: 'Beginner Champion', description: 'Pass all Beginner assessments', icon: '🥉', tier: 'bronze', category: 'special', requirement: { type: 'level', value: 3 }, xpBonus: 40, rarity: 'common' },
      { name: 'Intermediate Champion', description: 'Pass all Intermediate assessments', icon: '🥈', tier: 'silver', category: 'special', requirement: { type: 'level', value: 6 }, xpBonus: 100, rarity: 'rare' },
      { name: 'Advanced Champion', description: 'Pass all Advanced assessments', icon: '🥇', tier: 'gold', category: 'special', requirement: { type: 'level', value: 9 }, xpBonus: 250, rarity: 'legendary' },
    ];
    const created = await Badge.insertMany(badges);
    res.json({ message: 'Badges seeded!', count: created.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
module.exports.awardBadge = awardBadge;
