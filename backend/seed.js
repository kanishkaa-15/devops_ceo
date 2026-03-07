const mongoose = require('mongoose');
const User = require('./models/User');
const Staff = require('./models/Staff');
const Admission = require('./models/Admission');
const Query = require('./models/Query');
const Achievement = require('./models/Achievement');
const Announcement = require('./models/Announcement');
const Attendance = require('./models/Attendance');
const Grade = require('./models/Grade');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_ceo_dashboard');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Staff.deleteMany({});
    await Admission.deleteMany({});
    await Query.deleteMany({});
    await Achievement.deleteMany({});
    await Announcement.deleteMany({});
    await Attendance.deleteMany({});
    await Grade.deleteMany({});

    // Create default users
    const users = [
      { name: 'School Administrator', email: 'admin@school.edu', password: 'admin123', role: 'admin' },
      { name: 'School CEO', email: 'ceo@school.edu', password: 'ceo123', role: 'ceo' },
      { name: 'Staff Member', email: 'staff@school.edu', password: 'staff123', role: 'staff' },
      { name: 'Michael Thompson', email: 'parent@school.edu', password: 'parent123', role: 'parent', studentName: 'Alex Thompson' },
      { name: 'Raj Patel', email: 'raj@email.com', password: 'parent123', role: 'parent', studentName: 'Maya Patel' },
      { name: 'Robert Davis', email: 'robert@email.com', password: 'parent123', role: 'parent', studentName: 'Emma Davis' }
    ];

    for (const user of users) {
      await User.create(user);
    }
    console.log('Users seeded');

    // Create sample staff
    const staff = [
      { name: 'John Smith', email: 'john.smith@school.edu', department: 'Mathematics', position: 'Department Head', joinDate: new Date('2018-05-15'), status: 'Active', experience: 15 },
      { name: 'Maria Rodriguez', email: 'maria.rodriguez@school.edu', department: 'Mathematics', position: 'Senior Teacher', joinDate: new Date('2019-08-20'), status: 'Active', experience: 12 },
      { name: 'Sarah Johnson', email: 'sarah.j@school.edu', department: 'English', position: 'Department Head', joinDate: new Date('2020-08-10'), status: 'Active', experience: 10 }
    ];

    await Staff.insertMany(staff);
    console.log('Staff seeded');

    // Massive Dataset Generation
    const classes = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
    const sections = ['A', 'B', 'C', 'D'];
    const admissions = [];

    // Name pools for unique generation
    const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

    let nameIdx = 0;
    classes.forEach(grade => {
      sections.forEach(section => {
        // Create 10 students for each section
        for (let i = 1; i <= 10; i++) {
          const fName = firstNames[nameIdx % firstNames.length];
          const lName = lastNames[Math.floor(nameIdx / firstNames.length) % lastNames.length];
          const studentName = `${fName} ${lName}`;
          const studentId = `STU${String(1000 + nameIdx).padStart(4, '0')}`;

          admissions.push({
            studentId,
            studentName,
            parentName: `${lName} Parent`,
            email: `${fName.toLowerCase()}.${lName.toLowerCase()}${nameIdx}@school.edu`,
            phone: `+1-555-${String(nameIdx).padStart(4, '0')}`,
            grade,
            section,
            status: 'Approved',
            applicationDate: new Date('2024-01-01')
          });
          nameIdx++;
        }
      });
    });

    // Add original demo students
    admissions.push(
      { studentId: 'STU9001', studentName: 'Alex Thompson', parentName: 'Michael Thompson', email: 'alex.p@email.com', phone: '+1-555-9001', grade: 'Class 9', section: 'A', status: 'Approved', applicationDate: new Date('2024-01-15') },
      { studentId: 'STU9002', studentName: 'Maya Patel', parentName: 'Raj Patel', email: 'maya.p@email.com', phone: '+1-555-9002', grade: 'Class 9', section: 'A', status: 'Approved', applicationDate: new Date('2024-01-20') },
      { studentId: 'STU9003', studentName: 'Emma Davis', parentName: 'Robert Davis', email: 'emma.p@email.com', phone: '+1-555-9003', grade: 'Class 9', section: 'B', status: 'Approved', applicationDate: new Date('2024-01-18') }
    );

    // Add 5 ADDITIONAL students for Michael Thompson as requested
    for (let i = 1; i <= 5; i++) {
      const extraId = `STU_MT_${i}`;
      admissions.push({
        studentId: extraId,
        studentName: `Student ${i} Thompson`,
        parentName: 'Michael Thompson',
        email: `student${i}.t@email.com`,
        phone: `+1-555-800${i}`,
        grade: `Class ${6 + i}`,
        section: 'A',
        status: 'Approved',
        applicationDate: new Date('2024-02-01')
      });
    }

    await Admission.insertMany(admissions);
    console.log(`Admissions seeded: ${admissions.length} students`);

    // Create sample query
    await Query.create({
      parentName: 'Michael Thompson', studentName: 'Alex Thompson', email: 'parent@school.edu', phone: '+1-555-0101', subject: 'Tutoring', message: 'Help needed.', status: 'Open', priority: 'High'
    });

    // Create attendance
    const subjects = ['Mathematics', 'Science', 'English', 'Social Studies'];
    const attendanceRecords = [];

    admissions.forEach(student => {
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        if (date.getDay() !== 0 && date.getDay() !== 6) {
          subjects.forEach(subject => {
            attendanceRecords.push({
              studentId: student.studentId,
              studentName: student.studentName,
              class: student.grade,
              section: student.section,
              subject: subject,
              status: Math.random() > 0.1 ? 'Present' : 'Absent',
              date: new Date(date)
            });
          });
        }
      }
    });

    await Attendance.insertMany(attendanceRecords);
    console.log(`Seeded ${attendanceRecords.length} attendance records`);

    // Create grades
    const gradeRecords = [];
    const assessmentTypes = ['Mid-term', 'Project'];

    admissions.forEach(student => {
      subjects.forEach(subject => {
        for (let i = 0; i < 2; i++) {
          const score = 65 + Math.floor(Math.random() * 35);
          const date = new Date();
          date.setDate(date.getDate() - (i * 30));

          let gradeValue = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : 'D';

          gradeRecords.push({
            studentId: student.studentId,
            studentName: student.studentName,
            class: student.grade,
            section: student.section,
            subject: subject,
            grade: gradeValue,
            score: score,
            title: assessmentTypes[i],
            date: date
          });
        }
      });
    });

    await Grade.insertMany(gradeRecords);
    console.log(`Seeded ${gradeRecords.length} grade records`);

    console.log('Full Campus Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();