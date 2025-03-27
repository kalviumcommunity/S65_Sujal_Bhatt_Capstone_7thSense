const mongoose = require("mongoose");
const User = require("./userModel");

const systemSchema = new mongoose.Schema({
  rules: [{ type: String }],
  reports: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      description: { type: String, required: true },
      status: { type: String, enum: ["Pending", "Resolved"], default: "Pending" },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  supportTickets: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      issue: { type: String, required: true },
      status: { type: String, enum: ["Open", "Closed"], default: "Open" },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("System", systemSchema);
