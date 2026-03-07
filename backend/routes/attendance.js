const express = require('express');
const Attendance = require('../models/Attendance');
const Admission = require('../models/Admission');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// GET attendance with filters (Protected)
router.get('/', protect, async (req, res) => {
    try {
        const { studentName, grade, section, date } = req.query;
        let query = {};
        if (studentName) query.studentName = { $regex: new RegExp(studentName, 'i') };
        if (grade) query.class = grade;
        if (section) query.section = section;
        if (date) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            query.date = { $gte: start, $lte: end };
        }

        const attendance = await Attendance.find(query).sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET attendance by student name (Protected)
router.get('/:studentName', protect, async (req, res) => {
    try {
        const studentName = req.params.studentName;

        // Security check for parents
        if (req.user.role === 'parent') {
            const isAssigned = await Admission.findOne({
                studentName: { $regex: new RegExp(studentName, 'i') },
                $or: [
                    { parentName: { $regex: new RegExp(req.user.name, 'i') } },
                    { email: { $regex: new RegExp(req.user.email, 'i') } }
                ]
            });
            if (!isAssigned) {
                return res.status(403).json({ message: 'Access denied: This student is not assigned to you.' });
            }
        }

        const attendance = await Attendance.find({
            studentName: { $regex: new RegExp(studentName, 'i') }
        }).sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET attendance by student ID (Better precision) (Protected)
router.get('/id/:studentId', protect, async (req, res) => {
    try {
        const studentId = req.params.studentId;

        // Security check for parents
        if (req.user.role === 'parent') {
            const isAssigned = await Admission.findOne({
                studentId: studentId,
                $or: [
                    { parentName: { $regex: new RegExp(req.user.name, 'i') } },
                    { email: { $regex: new RegExp(req.user.email, 'i') } }
                ]
            });
            if (!isAssigned) {
                return res.status(403).json({ message: 'Access denied: This student is not assigned to you.' });
            }
        }

        const attendance = await Attendance.find({ studentId: studentId }).sort({ date: -1 });
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST bulk attendance
router.post('/bulk', async (req, res) => {
    try {
        const records = req.body; // Expecting array of { studentName, class, section, subject, status, date }
        const result = await Attendance.insertMany(records);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
