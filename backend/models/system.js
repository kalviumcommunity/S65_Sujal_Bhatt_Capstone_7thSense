const mongoose = require("mongoose");
const User = require("./models/user")

const systemSchema = new mongoose.Schema({
  rules: [{ type: String }],
  reports: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      description: { type: String, required: true },
      status: { type: String, enum: ["Pending", "Resolved"], default: "Pending" },
    },
  ],
  supportTickets: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      issue: { type: String, required: true },
      status: { type: String, enum: ["Open", "Closed"], default: "Open" },
    },
  ],
});

module.exports = mongoose.model("System", systemSchema);
