import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  nic: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  profilePicture: { type: String, required: true },
});

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
