const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  position: { type: String, required: true },
  joinDate: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  experience: { type: Number, required: true }
}, { timestamps: true });

// Optimize analytics calculations for retention rate
staffSchema.index({ status: 1, department: 1 });

module.exports = mongoose.model('Staff', staffSchema);