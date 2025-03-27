const express = require("express");
const Revenue = require("../models/revenueModel");
const router = express.Router();

router.get("/rewards/:userId", async (req, res) => {
  try {
    const revenue = await Revenue.findOne({ userId: req.params.userId });
    if (!revenue) return res.status(404).json({ message: "No rewards found" });
    res.json({ earned: revenue.earned, withdrawn: revenue.withdrawn });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/transactions/:userId", async (req, res) => {
  try {
    const revenue = await Revenue.findOne({ userId: req.params.userId });
    if (!revenue) return res.status(404).json({ message: "No transactions found" });
    res.json(revenue.transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/wallet/:userId", (req, res) => {
    res.json({ balance: "$5000", lastTransaction: "Withdrawal" });
  });


// POST

router.post("/wallet/deposit", async (req, res) => {
  try {
    const revenue = await Revenue.findOne({ userId: req.body.userId });
    if (!revenue) return res.status(404).json({ message: "User not found" });
    revenue.transactions.push({ type: "Deposit", amount: req.body.amount });
    revenue.earned += req.body.amount;
    await revenue.save();
    res.json({ message: "Money deposited successfully", amount: req.body.amount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
  
router.post("/wallet/withdraw", (req, res) => {
    res.json({ message: "Withdrawal request submitted", amount: "$10" });
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