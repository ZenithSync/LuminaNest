const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String }, // emoji or image url
  tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum', 'special'], default: 'bronze' },
  category: { type: String, enum: ['level', 'streak', 'quiz', 'course', 'competition', 'special'], default: 'level' },
  requirement: {
    type: { type: String }, // 'xp', 'streak', 'quizScore', 'coursesCompleted', 'rank'
    value: Number
  },
  xpBonus: { type: Number, default: 0 },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Badge', badgeSchema);
