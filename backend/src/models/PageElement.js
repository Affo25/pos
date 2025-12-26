const mongoose = require('mongoose');

const additionalSettingsSchema = new mongoose.Schema({
    options_type: { type: String, enum: ['manual', 'collection'] },
    options: { type: [String] },
    collection_name: { type: String },
    element_name: { type: String },
});

const pageElementSchema = new mongoose.Schema({
    page_id: { type: String, required: true },
    type: { type: String, required: true },
    name: { type: String, required: true },
    key: { type: String, required: true },
    label: { type: String },
    placeholder: { type: String },
    required: { type: Boolean, default: false },
    no_duplicate: { type: Boolean, default: false },
    incremental: { type: Boolean, default: false },
    prefix: { type: String },
    digits: { type: Number, default: 0 },
    default_value: { type: String },
    maxlength: { type: Number, default: 0 },
    multiline: { type: Boolean, default: false },
    rows: { type: Number, default: 1 },
    priority: { type: Number, default: 0 },
    file_type: { type: String },
    show_preview: { type: Boolean, default: false },
    multiple_files: { type: Boolean, default: false },
    style_css: { type: String },
    enable_in_new: { type: Boolean, default: false },
    enable_in_list: { type: Boolean, default: false },
    enable_in_update: { type: Boolean, default: false },
    ui_width: { type: String },
    additional_settings: additionalSettingsSchema,
}, { timestamps: { createdAt: 'createdOn', updatedAt: 'updatedOn' } });

module.exports = mongoose.model('PageElement', pageElementSchema,);
