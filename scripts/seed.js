import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('Please define MONGO_URI environment variable');
  process.exit(1);
}

const StudentSchema = new mongoose.Schema({
  nic: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  profilePicture: { type: String, required: true },
});

const AttendanceSchema = new mongoose.Schema({
  nic: { type: String, required: true },
  date: { type: String, required: true },
  inTime: { type: String },
  outTime: { type: String },
  timestamp: { type: String, required: true },
  lastUpdated: { type: String, required: true },
});
AttendanceSchema.index({ nic: 1, date: 1 }, { unique: true });

const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);
const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema, 'attendance');

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const studentsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/students.json'), 'utf8'));
    const attendanceData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/attendance.json'), 'utf8'));

    // Clear existing data
    await Student.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Cleared existing collections');

    // Insert new data
    await Student.insertMany(studentsData);
    await Attendance.insertMany(attendanceData);

    console.log('Successfully seeded database');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
