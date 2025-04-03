const express = require("express");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const router = express.Router();

// GET
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("friends");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/users/:id/stats", async (req, res) => {
  res.json({ userId: req.params.id, winRate: "75%", accuracy: "82%", earnings: "$250" });
});

router.get("/users/:id/history", (req, res) => {
  res.json([{ matchId: 1, result: "Win" }, { matchId: 2, result: "Loss" }]);
});

router.get("/users/:id/badge", (req, res) => {
  res.json({ badge: "Silver" });
});

router.get("/users/:id/friends", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("friends");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ friends: user.friends });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/users/:id/settings", (req, res) => {
  res.json({ settings: { notifications: true, darkMode: false } });
});

// POST
router.post("/signup", async (req, res) => {
  try {
    const {email, password} = req.body

    if (!email){
      return res.status(400).send("Email field is required")
    } 
    if (!password){
      return res.status(400).send("Password is required")
    }
    if (password.length < 8 || password.length > 16){
      return res.status(400).send("Password must be between 8 and 16 characters")
    }
    const existingUser = await User.findOne({email})
    if (existingUser){
      return res.status(400).send("User already exists!")
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({ ...req.body, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user){
      return res.status(400).send("User doesn't exist!")
    } 

    const isMatch = await bcrypt.compare(req.body.password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.json({ message: "User logged in successfully", userId: user._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
router.put("/update-password", async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.password = req.body.password; 
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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

module.exports = router;