const mongoose = require('mongoose');

const PurchaseOrderSchema = new mongoose.Schema({
  supplier_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Suppliers',
    required: true,
  },
  order_number: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  order_date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'received', 'cancelled'],
    default: 'pending',
  },
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'admins', required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
