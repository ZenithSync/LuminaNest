const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  issuedAt: { type: Date, default: Date.now },
  certificateId: { type: String, unique: true },
  grade: { type: String, default: 'Pass' }, // Pass, Merit, Distinction
  finalScore: { type: Number, default: 0 }
});

certificateSchema.pre('save', function(next) {
  if (!this.certificateId) {
    this.certificateId = 'LN-' + uuidv4().split('-')[0].toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
