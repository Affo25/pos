const mongoose = require('mongoose');

const ProductsSchema = new mongoose.Schema({
  category_id: { type: String, required: true },
  sub_category_id: { type: String, required: true },
  name: { type: String, required: true },
  sku: { type: String, required: true },
  description: { type: String, required: true },
  unit: { type: String, required: true },
  cost_price: { type: String, required: true },
  selling_price: { type: String, required: true },
  tax_rate: { type: String, required: true },
  reorder_level: { type: String, required: true },
  total_stock: { type: String, required: true },
  last_purchase_price: { type: String, required: true },
  last_purchase_date: { type: String, required: true },
  status: { type: String, required: true },
  admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'admins', required: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Products', ProductsSchema);
