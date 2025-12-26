const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  fatherName: { type: String, required: true },
  title: { type: String, required: true },
  staffType: { type: String },
  departmentCode: { type: String },
  facultyCode: { type: String },
  jobTitle: { type: String, required: true },
  identityNo: { type: String },
  identityType: { type: String },
  gender: { type: String },
  dob: { type: String },
  religion: { type: String },
  nationality: { type: String },
  contactNo: { type: String },
  email: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  status: { type: String },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BranchProfiles' },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'clients', required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Staff', StaffSchema);
