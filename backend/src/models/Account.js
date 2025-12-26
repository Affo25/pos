const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema(
  {
    accountName: { type: String, required: true },
    accountType: { type: String, required: true },
    openingBalance: { type: String, required: true },
    accountHeadId: { type: String },
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

module.exports = mongoose.model("Account", AccountSchema);
