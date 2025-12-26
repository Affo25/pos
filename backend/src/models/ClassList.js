const mongoose = require('mongoose');

const ClassListSchema = new mongoose.Schema({
  code: { type: String, required: true },
  name: { type: String, required: true },
  classCode: { type: String },
  dateFrom: { type: String, required: true },
  dateTo: { type: String, required: true },
  subjectId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    }
  ],
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BranchProfiles' },
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'clients', required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
}, { timestamps: true });

module.exports = mongoose.model('ClassList', ClassListSchema);
