const mongoose = require('mongoose');

const ProductsSchema = new mongoose.Schema({
  category_id: {
    type: String, required: true
  },
  sub_category_id: {
    type: String, required: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 150,
    trim: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    maxlength: 50,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  unit: {
    type: String,
    maxlength: 20,
    trim: true,
  },
  cost_price: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  selling_price: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  tax_rate: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  reorder_level: {
    type: Number,
    min: 0,
    default: 0,
  },
  total_stock: {
    type: Number,
    min: 0,
    default: 0,
    comment: 'Total stock across all locations',
  },
  last_purchase_price: {
    type: Number,
    min: 0,
    default: 0,
    comment: 'Last purchase price for reference',
  },
  last_purchase_date: {
    type: Date,
    comment: 'Date of last purchase',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'admins', required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Products', ProductsSchema);
