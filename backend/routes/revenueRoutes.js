const express = require("express");
const Revenue = require("../models/revenueModel");
const router = express.Router();

// GET

router.get("/rewards/:userId", async (req, res) => {
  try {
    const revenue = await Revenue.findOne({ userId: req.params.userId }).populate("userId"); 
    if (!revenue) return res.status(404).json({ message: "No rewards found" });
    res.json({ earned: revenue.earned, withdrawn: revenue.withdrawn });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/transactions/:userId", async (req, res) => {
  try {
    const revenue = await Revenue.findOne({ user: req.params.userId });
    if (!revenue || revenue.transactions.length === 0) {
      console.error(`No transactions found for userId: ${req.params.userId}`);
      return res.status(404).json({ message: "No transactions found" });
    }
    res.json(revenue.transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/wallet/:userId", (req, res) => {
    res.json({ balance: "$5000", lastTransaction: "Withdrawal" });
  });


// POST

router.post("/wallet/deposit", async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const revenue = await Revenue.findOne({ user: userId });
    if (!revenue) {
      return res.status(404).json({ message: "User not found" });
    }

    // Record the deposit transaction
    revenue.transactions.push({ amount, type: "credit" });
    revenue.walletBalance += amount; // Update wallet balance
    await revenue.save();

    res.json({ message: "Money deposited successfully", balance: revenue.walletBalance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/wallet/withdraw", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const revenue = await Revenue.findOne({ user: userId });
    if (!revenue || revenue.walletBalance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct the amount and record the transaction
    revenue.walletBalance -= amount;
    revenue.transactions.push({ amount, type: "debit" });
    await revenue.save();

    res.json({ message: "Withdrawal successful", balance: revenue.walletBalance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/wallet/transaction-history", (req, res) => {
    res.json({ transactions: [] }); 
  });
  
router.post("/wallet/reward-claim", (req, res) => {
    res.json({ message: "Reward claimed successfully", reward: "$50" });
  });

// PUT

router.put("/wallet/update-payment-method", (req, res) => {
  res.json({ message: "Payment method updated successfully" });
});

router.put("/wallet/cancel-withdrawal", (req, res) => {
  res.json({ message: "Withdrawal request canceled" });
});

router.put("/wallet/adjust-balance", (req, res) => {
  res.json({ message: "Wallet balance adjusted" });
});

module.exports = router;