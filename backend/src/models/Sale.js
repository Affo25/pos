const mongoose = require('mongoose');

const SaleItemSchema = new mongoose.Schema(
  {
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },
    product_name: { type: String, trim: true },
    quantity: { type: Number, min: 1, default: 1 },
    unit_price: { type: Number, min: 0, default: 0 },
    discount: { type: Number, min: 0, default: 0 },
    tax: { type: Number, min: 0, default: 0 },
    line_total: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const SaleSchema = new mongoose.Schema({
  invoice_no: { type: String, trim: true, unique: true, sparse: true },
  customer_id: { type: String },
  customer_name: { type: String, trim: true },
  items: {
    type: [SaleItemSchema],
    default: [],
  },
  total_amount: {
    type: Number,
    required: true,
    default: 0,
  },
  discount_amount: {
    type: Number,
    default: 0,
  },
  tax_amount: {
    type: Number,
    default: 0,
  },
  net_amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['completed', 'cancelled'],
    default: 'completed',
  },
  sale_date: {
    type: Date,
    required: true,
  },
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'admins', required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Sale', SaleSchema);
