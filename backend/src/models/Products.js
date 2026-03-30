const mongoose = require('mongoose');

const ProductsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 150,
    trim: true,
    comment: 'Exact name of the medicine',
  },
  batch_number: {
    type: String,
    required: true,
    maxlength: 50,
    trim: true,
    comment: 'Batch number of the medicine',
  },
  expiry_date: {
    type: Date,
    required: true,
    comment: 'Valid till date',
  },
  available_quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
    comment: 'Current units in stock',
  },
  minimum_stock_alert: {
    type: Number,
    min: 0,
    default: 0,
    comment: 'Threshold quantity to trigger low stock alert',
  },
  unit_price: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
    comment: 'Per unit price or MRP',
  },
  total_value: {
    type: Number,
    min: 0,
    default: 0,
    comment: 'Total value of stock (unit_price * available_quantity)',
  },
  supplier_name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150,
    comment: 'Supplier from which medicine was received',
  },
  manufacturer: {
    type: String,
    trim: true,
    maxlength: 150,
    comment: 'Manufacturer of the medicine',
  },
  category: {
    type: String,
    required: true,
    enum: ['tablet', 'syrup', 'injection', 'ointment', 'other'],
    comment: 'Medicine type/category',
  },
  rack_location: {
    type: String,
    trim: true,
    maxlength: 50,
    comment: 'Pharmacy shelf location',
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
    comment: 'Discount or offer in percentage',
  },
  gst: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
    comment: 'Applicable GST or tax percentage',
  },
  alternative_medicines: {
    type: [String],
    default: [],
    comment: 'Optional alternative medicine suggestions',
  },
  image: {
    type: String,
    trim: true,
    comment: 'URL or path of medicine image',
  },
  storage_instructions: {
    type: String,
    trim: true,
    comment: 'How to store the medicine properly',
  },
  notes: {
    type: String,
    trim: true,
    comment: 'Additional info or instructions',
  },
  is_prescription_required: {
    type: Boolean,
    default: false,
    comment: 'Whether the medicine requires prescription',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'admins',
    required: true,
  },
    manufacturer_license_no: {
    type: String,
    trim: true,
    maxlength: 50,
    comment: 'Manufacturer license number',
  },
   medicine_size: {
    type: String,
    trim: true,
    maxlength: 50,
    comment: 'Size or dosage of the medicine',
  },
  manufacturer_registration_no: {
    type: String,
    trim: true,
    maxlength: 50,
    comment: 'Manufacturer registration number',
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
}, { timestamps: true });

// Pre-save hook to auto calculate total_value
ProductsSchema.pre('save', function(next) {
  this.total_value = this.unit_price * this.available_quantity;
  next();
});

module.exports = mongoose.model('Products', ProductsSchema);