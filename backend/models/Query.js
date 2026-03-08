const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  parentName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  studentName: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  sentiment: { type: String, enum: ['Positive', 'Neutral', 'Concerned'], default: 'Neutral' },
  response: { type: String },
  assignedTo: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Query', querySchema);