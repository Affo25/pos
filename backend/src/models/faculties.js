const mongoose = require('mongoose');

const facultieschema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String },
  status: { type: String, default: 'active' },
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'admins', required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

}, { timestamps: true });

module.exports = mongoose.model('faculties', facultieschema);
