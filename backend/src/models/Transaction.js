const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    transactionDate: { type: String, required: true },
    description: { type: String, required: true },
    debit: { type: String, required: true },
    credit: { type: String, required: true },
    accountId: { type: String },
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

module.exports = mongoose.model("Transaction", TransactionSchema);
