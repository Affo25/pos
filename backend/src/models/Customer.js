const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contact: { type: String },
    password: { type: String, required: true },
    status: { type: String, default: 'active' },
    access_rights: { type: [String], default: [] },
    last_login_time: { type: Date }
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } });

module.exports = mongoose.model('Customer', customerSchema);
