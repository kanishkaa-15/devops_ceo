const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  studentId: { type: String, unique: true },
  studentName: { type: String, required: true },
  parentName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  grade: { type: String, required: true },
  section: { type: String, default: 'A' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  applicationDate: { type: Date, default: Date.now },
  documents: [{ type: String }],
  notes: { type: String }
}, { timestamps: true });

// Performance index for analytics dashboard and search
admissionSchema.index({ status: 1, grade: 1 });
admissionSchema.index({ studentName: 'text' });

module.exports = mongoose.model('Admission', admissionSchema);