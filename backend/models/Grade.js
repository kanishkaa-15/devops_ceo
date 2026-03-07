const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
    studentId: { type: String },
    studentName: { type: String, required: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    subject: { type: String, required: true },
    grade: { type: String, required: true }, // e.g. A, B+, etc.
    score: { type: Number, required: true }, // e.g. 85, 92
    title: { type: String, required: true }, // e.g. Mid-term Quiz, Final Exam
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Grade', gradeSchema);
