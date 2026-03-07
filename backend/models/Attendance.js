const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    studentId: { type: String },
    studentName: { type: String, required: true },
    class: { type: String, required: true },
    section: { type: String, required: true },
    subject: { type: String, required: true },
    status: { type: String, enum: ['Present', 'Absent'], default: 'Present' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
