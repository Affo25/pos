const mongoose = require('mongoose');

const FeeStructuresSchema = new mongoose.Schema({
  classListId: { type: String },
  feeTypeCode: { type: String },
  accountId: { type: String },
  feeAmount: { type: String },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BranchProfiles' },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'clients', required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
}, { timestamps: true });

module.exports = mongoose.model('FeeStructures', FeeStructuresSchema);
