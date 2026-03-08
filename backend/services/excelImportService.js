const xlsx = require('xlsx');
const Admission = require('../models/Admission');
const Grade = require('../models/Grade');

/**
 * Service to parse Excel files and upsert student data into the Admission and Grade collections.
 */
const importExcelData = async (filePath, io) => {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const datasheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(datasheet);

    console.log(`Excel Service: Processing ${data.length} records from ${filePath}`);

    const results = {
      added: 0,
      updated: 0,
      failed: 0,
      gradesUpdated: 0
    };

    const SUBJECTS = ['Mathematics', 'Science', 'English', 'Social Studies'];

    for (const row of data) {
      try {
        const studentId = row.studentId || row['Student ID'] || row.ID || row.id;
        const studentName = row.studentName || row['Student Name'] || row.Name || row.name;
        const gradeLevel = row.grade || row['Grade'] || row.Class || row.class;
        const section = row.section || row['Section'] || 'A';

        if (!studentName && !studentId) {
          results.failed++;
          continue;
        }


        // 1. Upsert Admission/Profile
        // Try to find existing student first by ID OR Name
        let studentDoc = null;
        if (studentId) {
          studentDoc = await Admission.findOne({ studentId });
        }
        if (!studentDoc && studentName) {
          studentDoc = await Admission.findOne({ 
            studentName: { $regex: new RegExp(`^${studentName}$`, 'i') } 
          });
        }
        
        // If not found and no grade info in Excel, we can't create a new student
        if (!studentDoc && !gradeLevel) {
          results.failed++;
          continue;
        }

        const studentData = {
          studentId: studentId || (studentDoc ? studentDoc.studentId : `STU${Date.now()}${Math.floor(Math.random() * 1000)}`),
          studentName: studentName || (studentDoc ? studentDoc.studentName : ''),
          parentName: row.parentName || row['Parent Name'] || (studentDoc ? studentDoc.parentName : 'N/A'),
          email: row.email || row['Email'] || (studentDoc ? studentDoc.email : 'N/A'),
          phone: row.phone || row['Phone'] || (studentDoc ? studentDoc.phone : 'N/A'),
          grade: (gradeLevel ? gradeLevel.toString() : (studentDoc ? studentDoc.grade : '')),
          section: (row.section || row['Section'] || (studentDoc ? studentDoc.section : 'A')).toString(),
          status: 'Approved'
        };

        if (studentDoc) {
          await Admission.findByIdAndUpdate(studentDoc._id, studentData);
          results.updated++;
          if (io) io.emit('updateAdmission', { ...studentData, _id: studentDoc._id });
        } else {
          studentDoc = new Admission(studentData);
          await studentDoc.save();
          results.added++;
          if (io) io.emit('newAdmission', studentDoc);
        }

        // 2. Upsert Individual Subject Grades
        for (const subject of SUBJECTS) {
          const rawScore = row[subject];
          if (rawScore !== undefined && rawScore !== null && rawScore !== '-') {
            // Strip % if present and parse as number
            let score = typeof rawScore === 'string' 
              ? parseFloat(rawScore.replace(/[^\d.]/g, '')) 
              : parseFloat(rawScore);

            // Handle decimal percentages (0.85 -> 85)
            if (score > 0 && score <= 1) {
              score = Math.round(score * 100);
            }

            if (!isNaN(score)) {
              const gradeData = {
                studentId: studentData.studentId,
                studentName: studentData.studentName,
                class: studentData.grade,
                section: studentData.section,
                subject,
                score,
                grade: score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : 'C',
                title: 'Excel Sync',
                date: new Date()
              };

              // Upsert Grade: Update existing 'Excel Sync' grade for this subject or create new
              const upsertResult = await Grade.findOneAndUpdate(
                { 
                  studentId: studentData.studentId, 
                  subject, 
                  title: 'Excel Sync' 
                },
                gradeData,
                { upsert: true, new: true, setDefaultsOnInsert: true }
              );
              console.log(`Excel Service: Upserted grade for ${studentData.studentName} - ${subject}: ${score}`, upsertResult ? 'SUCCESS' : 'FAILED');
              results.gradesUpdated++;
            }
          }
        }
      } catch (err) {
        console.error('Excel Service: Error processing row', row, err);
        results.failed++;
      }
    }

    // Refresh dashboard if grades were updated
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
