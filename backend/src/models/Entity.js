const mongoose = require('mongoose');

const entitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    page_key: { type: String, required: true, unique: true },
    status: { type: String, default: 'active' },
    data_key: { type: String, required: true },
    // user_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: true
    // }
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } });

module.exports = mongoose.model('Entity', entitySchema);
