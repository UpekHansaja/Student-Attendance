import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  nic: { type: String, required: true },
  date: { type: String, required: true },
  inTime: { type: String },
  outTime: { type: String },
  timestamp: { type: String, required: true },
  lastUpdated: { type: String, required: true },
});

AttendanceSchema.index({ nic: 1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema, 'attendance');
