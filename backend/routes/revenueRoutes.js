const express = require("express")
const router = express.Router()

router.get("/rewards/:userId", (req, res) => {
    res.json({ earned: "$300", withdrawn: "$150" });
  });
  
router.get("/transactions/:userId", (req, res) => {
    res.json([{ id: 1, type: "Deposit", amount: "$50" }, { id: 2, type: "Winnings", amount: "$100" }]);
  });
  
router.get("/wallet/:userId", (req, res) => {
    res.json({ balance: "$5000", lastTransaction: "Withdrawal" });
  });


// POST

router.post("/wallet/deposit", (req, res) => {
    res.json({ message: "Money deposited successfully", amount: "$10" });
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

module.exports = router