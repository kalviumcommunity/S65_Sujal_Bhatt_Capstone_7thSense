const express = require("express");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const Revenue = require("../models/revenueModel"); // Add this import
const jwt = require('jsonwebtoken');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const validateUserData = require('../middleware/validateUserData');

// GET
router.get("/users/:id", isAuthenticated, async (req, res) => {
  try {
    console.log('Fetching user data for ID:', req.params.id);
    const user = await User.findById(req.params.id)
      .select('-password -accessToken -refreshToken -googleId')
      .lean(); // Use lean() for better performance since we don't need the mongoose document
    
    if (!user) {
      console.log('User not found:', req.params.id);
      return res.status(404).json({ message: "User not found" });
    }

    // Log profile picture information
    console.log('Profile picture debug:', {
      userId: user._id,
      hasPicture: !!user.picture,
      pictureUrl: user.picture,
      profilePictureUrl: user.profilePictureUrl,
      name: user.name
    });

    // Add profile picture URL - prioritize the actual Google picture over the virtual property
    const profilePictureUrl = user.picture || user.profilePictureUrl;

    // Prepare the response data
    const userData = {
      ...user,
      profilePictureUrl,
      picture: user.picture // Also include the original picture field
    };

    console.log('Sending user data:', {
      id: userData._id,
      name: userData.name,
      picture: userData.picture,
      profilePictureUrl: userData.profilePictureUrl
    });

    res.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
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

// GET /profile
router.get("/profile", isAuthenticated, async (req, res) => {
  try {
    console.log('=== Profile Fetch Debug ===');
    console.log('Fetching profile for user:', req.user._id);
    
    const user = await User.findById(req.user._id)
      .select('-password -accessToken -refreshToken')
      .populate('matchHistory.opponent', 'name picture');
    
    if (!user) {
      console.log('User not found:', req.user._id);
      return res.status(404).json({ message: "User not found" });
    }

    // Log raw user data before validation
    console.log('Raw user data before validation:', {
      matchesPlayed: user.matchesPlayed,
      matchesWon: user.matchesWon,
      winRate: user.winRate,
      currentStreak: user.currentStreak,
      bestStreak: user.bestStreak,
      totalEarnings: user.totalEarnings,
      matchHistoryLength: user.matchHistory?.length || 0
    });

    // Validate and sanitize user data
    const validatedUser = validateUserData(user);

    // Log validated data
    console.log('Validated user data:', {
      matchesPlayed: validatedUser.matchesPlayed,
      matchesWon: validatedUser.matchesWon,
      winRate: validatedUser.winRate,
      currentStreak: validatedUser.currentStreak,
      bestStreak: validatedUser.bestStreak,
      totalEarnings: validatedUser.totalEarnings,
      matchHistoryLength: validatedUser.matchHistory?.length || 0
    });

    // Log profile picture information
    console.log('Profile picture debug:', {
      userId: user._id,
      hasPicture: !!user.picture,
      pictureUrl: user.picture,
      profilePictureUrl: user.profilePictureUrl,
      name: user.name
    });

    // Add profile picture URL - prioritize the actual Google picture over the virtual property
    validatedUser.profilePictureUrl = user.picture || user.profilePictureUrl;
    validatedUser.picture = user.picture; // Also include the original picture field

    console.log('Final profile picture data:', {
      picture: validatedUser.picture,
      profilePictureUrl: validatedUser.profilePictureUrl
    });

    res.json({ user: validatedUser });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Proxy endpoint for profile pictures to handle CORS issues
router.get("/profile-picture-proxy", async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      console.error('Profile picture proxy: No URL provided');
      return res.status(400).json({ message: "URL parameter is required" });
    }

    console.log('Profile picture proxy: Fetching URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    console.log('Profile picture proxy: Response status:', response.status);

    if (!response.ok) {
      console.error('Profile picture proxy: Failed to fetch image:', response.status, response.statusText);
      return res.status(response.status).json({ message: "Failed to fetch image" });
    }

    // Fix: Use Buffer.from(await response.arrayBuffer()) for node-fetch v3+
    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    console.log('Profile picture proxy: Successfully fetched image, size:', buffer.length, 'bytes, type:', contentType);
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(buffer);
    
  } catch (error) {
    console.error('Profile picture proxy: Error proxying image:', error);
    res.status(500).json({ message: "Failed to proxy image" });
  }
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
    
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;
    
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