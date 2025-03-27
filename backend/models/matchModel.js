const mongoose = require("mongoose");
const User = require("./userModel"); // Fixed import path

const matchSchema = new mongoose.Schema({
  matchId: { type: Number, required: true, unique: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  result: { type: String, enum: ["Win", "Loss", "Draw"], required: true },
  scores: { type: Map, of: Number }, 
  status: { type: String, enum: ["Waiting", "Ongoing", "Completed"], default: "Waiting" },
  gameMode: { type: String, enum: ["1V1", "Battle Royale"], default: "1V1" },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Match", matchSchema);
