const mongoose = require("mongoose");

const GuardianSchema = new mongoose.Schema(
  {
    guardianCode: { type: String, required: true },
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    fatherCNIC: { type: String, required: true },
    identityType: { type: String },
    identityNo: { type: String, required: true },
    contactNo: { type: String, required: true },
    email: { type: String, required: true },
    streetAddress: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    branch_id: { type: mongoose.Schema.Types.ObjectId, ref: "BranchProfiles" },
    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "clients",
      required: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Guardian", GuardianSchema);
