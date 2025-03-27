const express = require("express");
const Match = require("../models/matchModel");
const User = require("../models/userModel");
const router = express.Router();

router.get("/matches/:id", async (req, res) => {
  try {
    const match = await Match.findById(req.params.id).populate("players"); 
    if (!match) return res.status(404).json({ message: "Match not found" });
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/matchmaking/:userId", async (req, res) => {
  try {
    const matches = await Match.find({ status: "Waiting" });
    res.json({ message: "Available match lobbies", matches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
  
router.get("/matches/:id/history", (req, res) => {
    res.json([{ matchId: req.params.id, history: "Detailed match history goes here" }]);
  });
  
router.get("/questions/:matchId", (req, res) => {
    res.json({ message: "Questions for match", questions: ["Q1", "Q2", "Q3"] });
  });


// POST

router.post("/game/join", (req, res) => {
    res.json({ message: "User joined the game", gameMode: "1V1" });
  });
  
router.post("/game/matchmaking", async (req, res) => {
  try {
    const match = new Match({ players: [req.body.userId], status: "Waiting" });
    await match.save();
    res.json({ message: "Matchmaking started", matchId: match._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}); 
  
router.post("/match/ready", (req, res) => {
    res.json({ message: "Player is ready for the match" });
  });
  
router.post("/match/start", (req, res) => {
    res.json({ message: "Match started!" });
  });
  
router.post("/game/submit-answer", (req, res) => {
    res.json({ message: "Answer submitted successfully" });
  });
  
router.post("/game/time-up", (req, res) => {
    res.json({ message: "Time up! Answer auto-submitted or skipped" });
  });
  
router.post("/game/score-update", (req, res) => {
    res.json({ message: "Score updated", score: 10 });
  });
  
router.post("/game/match-result", async (req, res) => {
  try {
    const match = await Match.findById(req.body.matchId);
    if (!match) return res.status(404).json({ message: "Match not found" });
    match.result = req.body.result;
    match.status = "Completed";
    await match.save();
    res.json({ message: "Match result recorded", match });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// PUT

router.put("/game/change-mode", (req, res) => {
  res.json({ message: "Game mode updated", newMode: "Battle Royale"});
});

router.put("/match/cancel", (req, res) => {
  res.json({ message: "Matchmaking canceled" });
});

router.put("/game/update-score", (req, res) => {
  res.json({ message: "Score updated", newScore: "20"});
});

router.put("/game/update-result", (req, res) => {
  res.json({ message: "Match result updated" });
});

router.put("/match/reconnect", (req, res) => {
  res.json({ message: "Reconnected to match" });
});

module.exports = router;