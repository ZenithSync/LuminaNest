const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Certificate = require('../models/Certificate');

router.get('/', auth, async (req, res) => {
  try {
    const certs = await Certificate.find({ user: req.user._id }).populate('course', 'title level category instructorName');
    res.json(certs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
