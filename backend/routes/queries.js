const express = require('express');
const Query = require('../models/Query');
const { protect } = require('../middleware/authMiddleware');
const { rbac } = require('../middleware/rbac');
const router = express.Router();

// GET all queries (Protected)
router.get('/', protect, async (req, res) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 });
    res.json(queries);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET query by ID (Protected)
router.get('/:id', protect, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ message: 'Query not found' });
    res.json(query);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST new query
router.post('/', async (req, res) => {
  try {
    const query = new Query(req.body);
    await query.save();

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('newQuery', query);
    }

    res.status(201).json(query);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update query (Protected)
router.put('/:id', protect, rbac(['ceo', 'admin']), async (req, res) => {
  try {
    const query = await Query.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!query) return res.status(404).json({ message: 'Query not found' });
    res.json(query);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE query (Protected)
router.delete('/:id', protect, rbac(['ceo', 'admin']), async (req, res) => {
  try {
    const query = await Query.findByIdAndDelete(req.params.id);
    if (!query) return res.status(404).json({ message: 'Query not found' });
    res.json({ message: 'Query deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;