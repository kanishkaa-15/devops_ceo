const express = require('express');
const Admission = require('../models/Admission');
const { protect } = require('../middleware/authMiddleware');
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

// GET admission by ID
router.get('/:id', async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ message: 'Admission not found' });
    res.json(admission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST new admission
router.post('/', async (req, res) => {
  try {
    const admissionData = { ...req.body };

    // Auto-generate studentId if not provided
    if (!admissionData.studentId) {
      const count = await Admission.countDocuments();
      admissionData.studentId = `STU${9000 + count + 1}`;
    }

    const admission = new Admission(admissionData);
    await admission.save();

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('newAdmission', admission);
    }

    res.status(201).json(admission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update admission
router.put('/:id', async (req, res) => {
  try {
    const admission = await Admission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!admission) return res.status(404).json({ message: 'Admission not found' });

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('updateAdmission', admission);
      console.log('AdmissionsRoute: updateAdmission event emitted');
    }

    res.json(admission);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE admission
router.delete('/:id', async (req, res) => {
  try {
    const admission = await Admission.findByIdAndDelete(req.params.id);
    if (!admission) return res.status(404).json({ message: 'Admission not found' });

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('deleteAdmission', { id: req.params.id });
    }

    res.json({ message: 'Admission deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;