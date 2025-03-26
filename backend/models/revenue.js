const mongoose = require("mongoose");
const User = require("./models/user")

const revenueSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  earned: { type: Number, default: 0 },
  withdrawn: { type: Number, default: 0 },
  transactions: [
    {
      type: { type: String, enum: ["Deposit", "Withdrawal", "Winnings"], required: true },
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Revenue", revenueSchema);
