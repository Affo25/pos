const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true },
    totalDays: { type: String, required: true },
    eventDate: { type: String },
    eventImage: [{ type: String }],
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

module.exports = mongoose.model("Event", EventSchema);
