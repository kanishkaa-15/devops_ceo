const express = require('express');
const Admission = require('../models/Admission');
const { protect } = require('../middleware/authMiddleware');
const { rbac } = require('../middleware/rbac');
const AuditLog = require('../models/AuditLog');
const router = express.Router();

// GET all admissions (Protected)
router.get('/', protect, async (req, res) => {
  try {
    const status = req.query.status?.toString().trim();
    const grade = req.query.grade?.toString().trim();
    const section = req.query.section?.toString().trim();

    let query = {};
    if (status) query.status = status;
    if (grade) query.grade = grade;
    if (section) query.section = section;
    const admissions = await Admission.find(query).sort({ studentName: 1 });
    res.json(admissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET students for a parent (Protected)
router.get('/parent/:parentName', protect, async (req, res) => {
  try {
    const parentName = req.params.parentName; // Legacy support, but we'll prioritize req.user

    // Enforcement: Use logged-in parent's info
    const parentIdentifier = req.user.role === 'parent' ? (req.user.name || req.user.email) : parentName;

    const admissions = await Admission.find({
      $or: [
        { parentName: { $regex: new RegExp(parentIdentifier, 'i') } },
        { email: { $regex: new RegExp(parentIdentifier, 'i') } }
      ],
      status: 'Approved'
    }).sort({ studentName: 1 });
    res.json(admissions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET admission by ID (Protected)
router.get('/:id', protect, rbac(['ceo', 'admin', 'staff']), async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ message: 'Admission not found' });
    res.json(admission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST new admission (Protected)
router.post('/', protect, rbac(['ceo', 'admin']), async (req, res) => {
  try {
    const admissionData = { ...req.body };

    // Auto-generate studentId if not provided
    if (!admissionData.studentId) {
      // Find the highest studentId to avoid collisions after deletion
      const admissions = await Admission.find({}, { studentId: 1 });
      let maxNum = 9000;
      admissions.forEach(a => {
        if (a.studentId && typeof a.studentId === 'string' && a.studentId.startsWith('STU')) {
          const num = parseInt(a.studentId.substring(3));
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      });
      admissionData.studentId = `STU${maxNum + 1}`;
    }

    const admission = new Admission(admissionData);
    await admission.save();

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('newAdmission', admission);
    }

    await AuditLog.create({
      userId: req.user._id,
      action: 'CREATE_DATA',
      endpoint: '/api/admissions',
      details: { admissionId: admission._id, studentName: admission.studentName }
    });

    res.status(201).json(admission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update admission (Protected)
router.put('/:id', protect, rbac(['ceo', 'admin', 'staff']), async (req, res) => {
  try {
    const admission = await Admission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!admission) return res.status(404).json({ message: 'Admission not found' });

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('updateAdmission', admission);
      console.log('AdmissionsRoute: updateAdmission event emitted');
    }

    await AuditLog.create({
      userId: req.user._id,
      action: 'UPDATE_DATA',
      endpoint: `/api/admissions/${req.params.id}`,
      details: { admissionId: admission._id }
    });

    res.json(admission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE admission (Protected)
router.delete('/:id', protect, rbac(['ceo', 'admin']), async (req, res) => {
  try {
    const admission = await Admission.findByIdAndDelete(req.params.id);
    if (!admission) return res.status(404).json({ message: 'Admission not found' });

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('deleteAdmission', { id: req.params.id });
    }

    await AuditLog.create({
      userId: req.user._id,
      action: 'DELETE_DATA',
      endpoint: `/api/admissions/${req.params.id}`,
      details: { admissionId: req.params.id }
    });

    res.json({ message: 'Admission deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;