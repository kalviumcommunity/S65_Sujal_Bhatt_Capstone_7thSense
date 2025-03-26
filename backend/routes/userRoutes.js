const express = require("express")
const router = express.Router()


const users = {
    1: { userId: 1, name: "John Doe", level: 5, balance: 100 },
    2: { userId: 2, name: "Alice", level: 7, balance: 250 }
  };
  
// GET

router.get("/users/:id", (req, res) => {
    const user = users[req.params.id] || null;
    res.json(user || { message: "User not found" });
  });
  
router.get("/users/:id/stats", (req, res) => {
    res.json({ userId: req.params.id, winRate: "75%", accuracy: "82%", earnings: "$250" });
  });
  
router.get("/users/:id/history", (req, res) => {
    res.json([{ matchId: 1, result: "Win" }, { matchId: 2, result: "Loss" }]);
  });
  
router.get("/users/:id/badge", (req, res) => {
    res.json({ badge: "Silver" });
  });
  
router.get("/users/:id/friends", (req, res) => {
    res.json({ friends: ["Player2", "Player3"] });
  });
  
router.get("/users/:id/settings", (req, res) => {
    res.json({ settings: { notifications: true, darkMode: false } });
  });


// POST 

router.post("/signup", (req, res) => {
    res.json({ message: "User registered successfully" });
  });
  
  
router.post("/login", (req, res) => {
    res.json({ message: "User logged in successfully", token: "JWT_TOKEN" });
  });
  
  
router.post("/verify-otp", (req, res) => {
    res.json({ message: "OTP verified successfully" });
  });
  
  
router.post("/logout", (req, res) => {
    res.json({ message: "User logged out successfully" });
  });

  
router.post("/profile/update", (req, res) => {
    res.json({ message: "Profile updated successfully" });
  });
  
  
router.post("/profile/progress", (req, res) => {
    res.json({ message: "User progress updated", rank: "Silver" });
  });


// PUT

router.put("/update-password", (req, res) => {
  res.json({ message: "Password updated successfully" });
});

router.put("/profile/update-avatar", (req, res) => {
  res.json({ message: "Avatar updated successfully" });
});

router.put("/profile/update-username", (req, res) => {
  res.json({ message: "Username updated successfully" });
});

router.put("/profile/update-rank", (req, res) => {
  res.json({ message: "User rank updated" });
});

module.exports = router