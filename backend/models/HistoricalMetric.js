const mongoose = require('mongoose');

const historicalMetricSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    metricsType: {
        type: String,
        required: true,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'daily'
    },
    academic: {
        type: Number,
        required: true
    },
    financial: {
        type: Number,
        required: true
    },
    wellbeing: {
        type: Number,
        required: true
    },
    efficiency: {
        type: Number,
        required: true
    },
    overallScore: {
        type: Number,
        required: true
    }
}, { timestamps: true });

// Ensure we only store one 'daily' metric per date string
historicalMetricSchema.index({ date: 1, metricsType: 1 });

module.exports = mongoose.model('HistoricalMetric', historicalMetricSchema);
