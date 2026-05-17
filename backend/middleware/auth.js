const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'luminanest_v2_secret');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;

    // Update streak for students
    if (user.role === 'student') {
      const today = new Date().toDateString();
      const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate).toDateString() : null;
      if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const newStreak = lastActive === yesterday.toDateString() ? user.streak + 1 : 1;
        await User.findByIdAndUpdate(user._id, { streak: newStreak, lastActiveDate: new Date() });
        req.user.streak = newStreak;
      }
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
