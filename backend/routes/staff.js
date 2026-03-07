const express = require('express');
const Staff = require('../models/Staff');
const { protect } = require('../middleware/authMiddleware');
const { rbac } = require('../middleware/rbac');
const router = express.Router();

// GET all staff (Protected)
router.get('/', protect, rbac(['ceo', 'admin']), async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET staff by ID (Protected)
router.get('/:id', protect, rbac(['ceo', 'admin']), async (req, res) => {
  try {
    const member = await Staff.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Staff member not found' });
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST new staff member (Protected)
router.post('/', protect, rbac(['ceo', 'admin']), async (req, res) => {
  try {
    const member = new Staff(req.body);
    await member.save();
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update staff member (Protected)
router.put('/:id', protect, rbac(['ceo', 'admin']), async (req, res) => {
  try {
    const member = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!member) return res.status(404).json({ message: 'Staff member not found' });
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE staff member (Protected)
router.delete('/:id', protect, rbac(['ceo', 'admin']), async (req, res) => {
  try {
    const member = await Staff.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ message: 'Staff member not found' });
    res.json({ message: 'Staff member deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;