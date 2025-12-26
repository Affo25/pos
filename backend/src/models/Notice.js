const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    periority: { type: String },
    vFrom: { type: String, required: true },
    vTo: { type: String, required: true },
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

module.exports = mongoose.model("Notice", NoticeSchema);
