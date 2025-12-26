const mongoose = require("mongoose");

const FeeCollectionSchema = new mongoose.Schema(
  {
    studentId: { type: String },
    feeHeadCode: { type: String },
    amount: { type: String, required: true },
    depositDate: { type: String, required: true },
    depositedBy: { type: String, required: true },
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

module.exports = mongoose.model("FeeCollection", FeeCollectionSchema);
