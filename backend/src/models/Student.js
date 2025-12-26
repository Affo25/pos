const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fatherName: { type: String, required: true },
  fatherCNIC: { type: String, required: true },
  regNo: { type: String, required: true },
  rollNo: { type: String, required: true },
  classCode: { type: String, required: true },
  identityNo: { type: String },
  identityType: { type: String },
  regDate: { type: Date },
  admissionFormNo: { type: String },
  gender: { type: String },
  dob: { type: Date },
  contactNo: { type: String },
  email: {
    type: String,
  },
  streetAddress: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
  birthPlace: { type: String },
  religion: { type: String },
  nationality: { type: String },
  bloodGroup: { type: String },
  emergencyContactName: { type: String },
  emergencyContactNo: { type: String },
  photo: { type: String },
  guardianIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Guardian',
    }
  ],
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BranchProfiles' },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'clients', required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
