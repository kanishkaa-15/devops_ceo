const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['Update', 'Event', 'Deadline'], default: 'Update' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', announcementSchema);
