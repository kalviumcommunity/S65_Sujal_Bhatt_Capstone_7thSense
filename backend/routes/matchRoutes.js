const express = require("express")
const router = express.Router()

const matches = [
    { id: 1, players: ["Alice", "Bob"], status: "Waiting", score: { Alice: 50, Bob: 40 } },
    { id: 2, players: ["John", "Mike"], status: "Ongoing", score: { John: 30, Mike: 25 } }
  ];
  
router.get("/matches/:id", (req, res) => {
    const match = matches.find(m => m.id == req.params.id);
    res.json(match || { message: "Match not found" });
  });
  
router.get("/matchmaking/:userId", (req, res) => {
    res.json({ message: "Available match lobbies", matches });
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
  
router.post("/game/matchmaking", (req, res) => {
    res.json({ message: "Finding an opponent..." });
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
  
router.post("/game/match-result", (req, res) => {
    res.json({ message: "Match result recorded", winner: "Player1" });
  });

module.exports = router