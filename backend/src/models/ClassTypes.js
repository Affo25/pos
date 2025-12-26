const mongoose = require('mongoose');

const ClassTypesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  status: { type: String, required: true },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BranchProfiles' },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'clients', required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
}, { timestamps: true });

module.exports = mongoose.model('ClassTypes', ClassTypesSchema);
