const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    board: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true },
    list: { type: mongoose.Schema.Types.ObjectId, ref: "List", required: true },
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    labels: [{ type: String }],
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    dueDate: { type: Date, default: null },
    completed: { type: Boolean, default: false },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Card", cardSchema);
