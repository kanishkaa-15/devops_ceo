const xlsx = require('xlsx');
const Admission = require('../models/Admission');
const Grade = require('../models/Grade');
const { sendPerformanceEmail } = require('../utils/emailService');
const { sendWhatsAppPerformanceAlert } = require('../utils/whatsappService');

/**
 * Service to parse Excel files and upsert student data into the Admission and Grade collections.
 */
const importExcelData = async (filePath, io) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const datasheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(datasheet);

    // Normalization Helpers
    const normalizeGrade = (val) => {
      if (!val) return '';
      let str = val.toString().trim().replace(/^(grade|class)\s+/i, '');
      if (/^\d+$/.test(str)) return `Class ${str}`;
      if (!str.toLowerCase().startsWith('class')) {
        return `Class ${str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()}`;
      }
      return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    const normalizeSection = (val) => {
      if (!val) return 'A';
      return val.toString().trim().toUpperCase();
    };

    console.log(`Excel Service: Processing ${data.length} records from ${filePath}`);

    const results = { added: 0, updated: 0, failed: 0, gradesUpdated: 0 };
    const SUBJECTS = ['Mathematics', 'Science', 'English', 'Social Studies'];
    
    // Performance Optimization: Fetch all students once
    const allStudents = await Admission.find({ status: 'Approved' });
    const studentMap = new Map();
    allStudents.forEach(s => {
      if (s.studentId) studentMap.set(s.studentId.toString().toLowerCase(), s);
      if (s.studentName) studentMap.set(s.studentName.toString().toLowerCase(), s);
    });

    const studentBulkOps = [];
    const gradeBulkOps = [];
    const notificationQueue = [];

    for (const row of data) {
      try {
        const studentId = (row.studentId || row['Student ID'] || row.ID || row.id)?.toString();
        const studentName = (row.studentName || row['Student Name'] || row.Name || row.name)?.toString();
        const rawGrade = row.grade || row['Grade'] || row.Class || row.class;
        const rawSection = row.section || row['Section'];

        if (!studentName && !studentId) {
          results.failed++;
          continue;
        }

        // Match student from Map
        const studentDoc = (studentId && studentMap.get(studentId.toLowerCase())) || 
                          (studentName && studentMap.get(studentName.toLowerCase()));

        if (!studentDoc && !rawGrade) {
          results.failed++;
          continue;
        }

        const normalizedGrade = normalizeGrade(rawGrade || (studentDoc ? studentDoc.grade : ''));
        const normalizedSection = normalizeSection(rawSection || (studentDoc ? studentDoc.section : 'A'));

        const studentData = {
          studentId: studentId || (studentDoc ? studentDoc.studentId : `STU${Date.now()}${Math.floor(Math.random() * 1000)}`),
          studentName: studentName || (studentDoc ? studentDoc.studentName : ''),
          parentName: row.parentName || row['Parent Name'] || (studentDoc ? studentDoc.parentName : 'N/A'),
          email: row.email || row['Email'] || (studentDoc ? studentDoc.email : 'N/A'),
          phone: row.phone || row['Phone'] || (studentDoc ? studentDoc.phone : 'N/A'),
          grade: normalizedGrade,
          section: normalizedSection,
          status: 'Approved'
        };

        // Queue student upsert
        studentBulkOps.push({
          updateOne: {
            filter: studentDoc ? { _id: studentDoc._id } : { studentId: studentData.studentId },
            update: { $set: studentData },
            upsert: true
          }
        });

        // 2. Queue Individual Subject Grades
        for (const subject of SUBJECTS) {
          const rawScore = row[subject];
          if (rawScore !== undefined && rawScore !== null && rawScore !== '-') {
            let score = typeof rawScore === 'string'
              ? parseFloat(rawScore.replace(/[^\d.]/g, ''))
              : parseFloat(rawScore);

            if (score > 0 && score <= 1) score = Math.round(score * 100);

            if (!isNaN(score)) {
              const gradeStatus = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : 'C';
              gradeBulkOps.push({
                updateOne: {
                  filter: { studentId: studentData.studentId, subject, title: 'Excel Sync' },
                  update: { 
                    $set: {
                      studentId: studentData.studentId,
                      studentName: studentData.studentName,
                      class: studentData.grade,
                      section: studentData.section,
                      subject,
                      score,
                      grade: gradeStatus,
                      title: 'Excel Sync',
                      date: new Date()
                    } 
                  },
                  upsert: true
                }
              });

              // Queue notification (Background)
              if (studentData.email || studentData.phone) {
                notificationQueue.push({
                  email: studentData.email,
                  phone: studentData.phone,
                  data: {
                    studentName: studentData.studentName,
                    subject,
                    score,
                    grade: gradeStatus,
                    title: 'Excel Sync'
                  }
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('Excel Service: Error processing row', row, err);
        results.failed++;
      }
    }

    // 3. Execute Bulk Operations
    if (studentBulkOps.length > 0) {
      console.log(`Excel Service: Executing ${studentBulkOps.length} student updates...`);
      const sResult = await Admission.bulkWrite(studentBulkOps);
      results.added = sResult.upsertedCount;
      results.updated = sResult.modifiedCount;
    }

    if (gradeBulkOps.length > 0) {
      console.log(`Excel Service: Executing ${gradeBulkOps.length} grade updates...`);
      const gResult = await Grade.bulkWrite(gradeBulkOps);
      results.gradesUpdated = gResult.upsertedCount + gResult.modifiedCount;
    }

    // 4. Fire notifications in background (Don't await)
    if (notificationQueue.length > 0) {
      console.log(`Excel Service: Sending ${notificationQueue.length} notifications in background...`);
      // We process a limited burst to avoid overwhelming the mail server immediately
      notificationQueue.slice(0, 100).forEach(n => {
        if (n.email && n.email !== 'N/A') sendPerformanceEmail({ parentEmail: n.email, ...n.data }).catch(() => {});
        if (n.phone && n.phone !== 'N/A') sendWhatsAppPerformanceAlert({ parentPhone: n.phone, ...n.data }).catch(() => {});
      });
    }

    if (results.gradesUpdated > 0 && io) {
      io.emit('gradesUpdated');
    }

    return results;
  } catch (error) {
    console.error('Excel Service: Critical error reading file', error);
    throw error;
  }
};

module.exports = { importExcelData };
