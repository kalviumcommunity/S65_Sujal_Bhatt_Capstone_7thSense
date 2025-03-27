const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  level: { type: Number, default: 1 },
  balance: { type: Number, default: 0 },
  settings: {
    notifications: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: false },
  },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  badge: { type: String, default: "Bronze" },
  rank: { type: String, default: "Beginner" },
});

module.exports = mongoose.model("User", userSchema);
