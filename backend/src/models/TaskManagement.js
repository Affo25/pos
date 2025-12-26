const mongoose = require('mongoose');

const TaskManagementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  periority: { type: String },
  assignedTo: { type: String },
  assignedDate: { type: String, required: true },
  endDate: { type: String, required: true },
  status: { type: String },
  taskImage: [{ type: String }],
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BranchProfiles' },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'clients' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
}, { timestamps: true });

module.exports = mongoose.model('TaskManagement', TaskManagementSchema);