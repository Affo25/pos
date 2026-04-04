const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    invoiceDesign: {
      template: { type: String, default: 'modern' },
      companyName: { type: String, default: 'Admin Company' },
      address: { type: String, default: '795 Folsom Ave, Suite 600, San Francisco, CA 94107, USA' },
      phone: { type: String, default: '+1 234 567 890' },
      email: { type: String, default: 'admin@example.com' },
      footerText: { type: String, default: 'Thank you for your business!' },
      logoUrl: { type: String },
      primaryColor: { type: String, default: '#667eea' },
      secondaryColor: { type: String, default: '#764ba2' },
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
