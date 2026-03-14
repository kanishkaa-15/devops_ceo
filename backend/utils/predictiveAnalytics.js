const Attendance = require('../models/Attendance');
const Grade = require('../models/Grade');

/**
 * Calculates a risk score for a student based on attendance and grade trends.
 * Includes consecutive absence penalties and momentum tracking (ML-lite heuristic).
 * Score: 0 (Low Risk) to 100 (High Risk)
 */
async function calculateStudentRisk(studentId) {
    try {
        const [attendance, grades] = await Promise.all([
            Attendance.find({ studentId }).sort({ date: -1 }).limit(30),
            Grade.find({ studentId }).sort({ date: -1 }).limit(10)
        ]);

        if (attendance.length === 0 && grades.length === 0) return 0;

        // 1. Advanced Attendance Risk (40%)
        const recentAttendance = attendance.slice(0, 14);
        let absentCount = 0;
        let consecutiveAbsences = 0;
        let maxConsecutive = 0;

        recentAttendance.forEach(a => {
            if (a.status === 'Absent') {
                absentCount++;
                consecutiveAbsences++;
                maxConsecutive = Math.max(maxConsecutive, consecutiveAbsences);
            } else {
                consecutiveAbsences = 0;
            }
        });

        const baseAttendanceRisk = recentAttendance.length > 0 ? (absentCount / recentAttendance.length) * 100 : 0;
        // Exponential penalty for consecutive absences (Truancy heuristic)
        const attendanceRisk = Math.min(baseAttendanceRisk + (maxConsecutive >= 3 ? 30 : 0), 100);

        // 2. Advanced Grade Risk with Momentum (60%)
        let gradeRisk = 0;
        if (grades.length >= 2) {
            const latest = grades[0].score;
            const previous = grades[1].score;
            let momentum = latest - previous;

            // If we have a 3rd data point, calculate acceleration
            if (grades.length >= 3) {
                const older = grades[2].score;
                const olderMomentum = previous - older;
                // If momentum is negative and accelerating downwards, severe penalty
                if (momentum < 0 && momentum < olderMomentum) {
                    gradeRisk += 30; // Free-fall penalty
                }
            }

            // Trend thresholds
            if (momentum <= -15) gradeRisk += 80;
            else if (momentum < -5) gradeRisk += 40;
            else if (momentum < 0) gradeRisk += 20;
            else gradeRisk += 5; // Base risk for stable

            // Critical low score floor penalty overrides trend
            if (latest < 60) gradeRisk = Math.max(gradeRisk, 95);
            else if (latest < 70) gradeRisk = Math.max(gradeRisk, 75);
        }

        const totalRisk = (attendanceRisk * 0.4) + (gradeRisk * 0.6);
        return Math.min(Math.round(totalRisk), 100);
    } catch (error) {
        console.error('Error calculating student risk:', error);
        return 0;
    }
}

/**
 * Projects the final outcome for a student based on recent performance.
 * Applies a time-weighted decay to older grades (Recency bias heuristic).
 */
async function projectAcademicOutcome(studentId) {
    try {
        const grades = await Grade.find({ studentId }).sort({ date: 1 });

        if (grades.length < 2) return null;

        const subjects = [...new Set(grades.map(g => g.subject))];

        const projections = subjects.map(subject => {
            const subjectGrades = grades.filter(g => g.subject === subject);
            if (subjectGrades.length < 2) return { subject, projected: null };

            // Apply exponential moving average (EMA) logic to project next score
            // Recent scores are weighted heavily, older scores decay
            let ema = subjectGrades[0].score;
            const alpha = 0.6; // Weighting factor for recency (0.6 heavily biases recent)

            for (let i = 1; i < subjectGrades.length; i++) {
                ema = (subjectGrades[i].score * alpha) + (ema * (1 - alpha));
            }

            const latest = subjectGrades[subjectGrades.length - 1].score;
            const previous = subjectGrades[subjectGrades.length - 2].score;
            const momentum = latest - previous;

            // Blend EMA with raw momentum mapping
            const projectedRaw = ema + (momentum * 0.2);
            const projected = Math.min(Math.max(projectedRaw, 0), 100);

            return {
                subject,
                current: latest,
                projected: Math.round(projected),
                trend: momentum > 2 ? 'Improving' : momentum < -2 ? 'Declining' : 'Stable'
            };
        });

        return projections;
    } catch (error) {
        console.error('Error projecting grades:', error);
        return null;
    }
}

module.exports = {
    calculateStudentRisk,
    projectAcademicOutcome
};
