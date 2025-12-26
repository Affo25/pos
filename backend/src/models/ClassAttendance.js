const mongoose = require('mongoose');

const ClassAttendanceSchema = new mongoose.Schema({
  student_id: { type: String, required: true },
  classCode: { type: String, required: true },
  date: { type: String, required: true },
  status: {
    type: String,
    enum: ["present", "absent", "onLeave"],
    required: true,
  },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BranchProfiles' },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'clients', required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
}, { timestamps: true });

module.exports = mongoose.model('ClassAttendance', ClassAttendanceSchema);
