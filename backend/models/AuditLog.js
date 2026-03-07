const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['GENERATED_REPORT', 'EXPORT_DATA', 'VIEW_SENSITIVE']
    },
    endpoint: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
