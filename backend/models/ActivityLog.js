const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    board: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true }, // e.g. "moved_card", "created_card", "commented", "assigned"
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    message: { type: String, required: true }, // human-readable text, e.g. "Ali moved 'Fix bug' to Done"
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
