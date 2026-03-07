const express = require('express');
const Grade = require('../models/Grade');
const Admission = require('../models/Admission');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// GET grades with filters (Protected)
router.get('/', protect, async (req, res) => {
    try {
        const { studentName, grade, section, subject } = req.query;
        let query = {};
        if (studentName) query.studentName = { $regex: new RegExp(studentName, 'i') };
        if (grade) query.class = grade;
        if (section) query.section = section;
        if (subject) query.subject = subject;

        const grades = await Grade.find(query).sort({ date: -1 });
        res.json(grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET grades by student name (Protected)
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

        const grades = await Grade.find({
            studentName: { $regex: new RegExp(studentName, 'i') }
        }).sort({ date: -1 });
        res.json(grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET grades by student ID (Better precision) (Protected)
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

        const grades = await Grade.find({ studentId: studentId }).sort({ date: -1 });
        res.json(grades);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST bulk grades
router.post('/bulk', async (req, res) => {
    try {
        const records = req.body; // Expecting array of { studentName, class, section, subject, grade, score, title, date }
        const result = await Grade.insertMany(records);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
