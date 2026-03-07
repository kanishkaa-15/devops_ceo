const cron = require('node-cron');
const Admission = require('../models/Admission');
const Query = require('../models/Query');
const Staff = require('../models/Staff');
const AuditLog = require('../models/AuditLog');
const connectDB = require('../config/database');
const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');

let io;

/**
 * Initialize Socket.io instance for the service
 * @param {Object} socketIo 
 */
function init(socketIo) {
    io = socketIo;
    console.log('ReportService: Socket.io initialized');
}

/**
 * Generates an Institutional Health Report PDF.
 * @param {string} userId - ID of the user triggering the report (optional)
 * @param {string} endpoint - The endpoint or source of the trigger (optional)
 */
async function generateHealthReport(userId = '60d5ecb8b392d700153ee000', endpoint = 'cron-job') {
    console.log(`Generating Institutional Health Report (Trigger: ${endpoint})...`);

    try {
        await connectDB();
        const admissionCount = await Admission.countDocuments();
        const openQueries = await Query.countDocuments({ status: 'Open' });
        const staffCount = await Staff.countDocuments();
        const activeStaff = await Staff.countDocuments({ status: 'Active' });

        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(0, 51, 102);
        doc.text('Institutional Health Report', 20, 30);

        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 40);
        doc.line(20, 45, 190, 45);

        // Stats Section
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text('Summary Statistics', 20, 60);

        doc.setFontSize(12);
        doc.text(`Total Admissions Managed: ${admissionCount}`, 30, 75);
        doc.text(`Current Open Parent Queries: ${openQueries}`, 30, 85);
        doc.text(`Total Staff Records: ${staffCount}`, 30, 95);
        doc.text(`Active Faculty: ${activeStaff}`, 30, 105);

        // Save report
        const reportsDir = path.join(__dirname, '../reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir);
        }

        const fileName = `HealthReport_${Date.now()}.pdf`;
        const filePath = path.join(reportsDir, fileName);
        doc.save(filePath);

        console.log(`Report generated successfully: ${filePath}`);

        // 🛡️ SECURITY: Log the action
        await AuditLog.create({
            userId,
            action: 'GENERATED_REPORT',
            endpoint,
            ipAddress: 'Internal/Server',
            details: {
                generatedPath: filePath,
                fileName,
                automated: endpoint === 'cron-job'
            }
        });

        // 🚀 REAL-TIME: Emit event
        if (io) {
            io.emit('report_generated', {
                message: endpoint === 'cron-job' ? 'Weekly health report generated automatically' : 'Health report generated successfully',
                fileName,
                timestamp: new Date()
            });
            console.log('ReportService: Socket event emitted');
        }

        return filePath;
    } catch (error) {
        console.error('Error generating report:', error);
    }
}

// Schedule automated reports (Sunday at Midnight)
cron.schedule('0 0 * * 0', async () => {
    generateHealthReport();
});

module.exports = { generateHealthReport, init };
