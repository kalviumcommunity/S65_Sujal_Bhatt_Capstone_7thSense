const mongoose = require("mongoose");
const User = require("./models/user")

const matchSchema = new mongoose.Schema({
  matchId: { type: Number, required: true, unique: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  result: { type: String, enum: ["Win", "Loss", "Draw"], required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Match", matchSchema);
