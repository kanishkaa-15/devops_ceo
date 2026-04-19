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
        
        // Upsert each record to prevent duplicate entries for the same student, subject, and day
        const bulkOps = records.map(record => {
            const start = new Date(record.date || Date.now());
            start.setHours(0, 0, 0, 0);
            const end = new Date(record.date || Date.now());
            end.setHours(23, 59, 59, 999);

            return {
                updateOne: {
                    filter: {
                        studentName: record.studentName,
                        subject: record.subject,
                        date: { $gte: start, $lte: end }
                    },
                    update: { $set: { ...record, date: record.date || new Date() } },
                    upsert: true
                }
            };
        });

        const result = await Attendance.bulkWrite(bulkOps);

        // Auto-Trigger Announcements for Absences
        const Announcement = require('../models/Announcement');
        const absentRecords = records.filter(r => r.status === 'Absent');

        if (absentRecords.length > 0) {
            const announcements = absentRecords.map(record => ({
                title: `Attendance Alert: ${record.studentName}`,
                content: `${record.studentName} was marked Absent for ${record.subject} on ${new Date(record.date || Date.now()).toLocaleDateString()}. Please contact the class teacher.`,
                type: 'Update',
                priority: 'High'
            }));
            await Announcement.insertMany(announcements);

            const io = req.app.get('io');
            if (io) {
                io.emit('newAnnouncement', { count: announcements.length });
            }
        }

        res.status(201).json({ message: 'Attendance processed successfully', result });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
