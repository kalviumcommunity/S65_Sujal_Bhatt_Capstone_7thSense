const express = require("express");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Dummy Data
const users = {
  1: { userId: 1, name: "John Doe", level: 5, balance: 100 },
  2: { userId: 2, name: "Alice", level: 7, balance: 250 }
};

const matches = [
  { id: 1, players: ["Alice", "Bob"], status: "Waiting", score: { Alice: 50, Bob: 40 } },
  { id: 2, players: ["John", "Mike"], status: "Ongoing", score: { John: 30, Mike: 25 } }
];


// User Management
app.get("/users/:id", (req, res) => {
  const user = users[req.params.id] || null;
  res.json(user || { message: "User not found" });
});

app.get("/users/:id/stats", (req, res) => {
  res.json({ userId: req.params.id, winRate: "75%", accuracy: "82%", earnings: "$250" });
});

app.get("/users/:id/history", (req, res) => {
  res.json([{ matchId: 1, result: "Win" }, { matchId: 2, result: "Loss" }]);
});

app.get("/users/:id/badge", (req, res) => {
  res.json({ badge: "Silver" });
});

app.get("/users/:id/friends", (req, res) => {
  res.json({ friends: ["Player2", "Player3"] });
});

app.get("/users/:id/settings", (req, res) => {
  res.json({ settings: { notifications: true, darkMode: false } });
});

// Quiz & Game Management

app.get("/matches/:id", (req, res) => {
  const match = matches.find(m => m.id == req.params.id);
  res.json(match || { message: "Match not found" });
});

app.get("/matchmaking/:userId", (req, res) => {
  res.json({ message: "Available match lobbies", matches });
});

app.get("/matches/:id/history", (req, res) => {
  res.json([{ matchId: req.params.id, history: "Detailed match history goes here" }]);
});

app.get("/questions/:matchId", (req, res) => {
  res.json({ message: "Questions for match", questions: ["Q1", "Q2", "Q3"] });
});



// Rewards & Earnings

app.get("/rewards/:userId", (req, res) => {
  res.json({ earned: "$300", withdrawn: "$150" });
});

app.get("/transactions/:userId", (req, res) => {
  res.json([{ id: 1, type: "Deposit", amount: "$50" }, { id: 2, type: "Winnings", amount: "$100" }]);
});

app.get("/wallet/:userId", (req, res) => {
  res.json({ balance: "$5000", lastTransaction: "Withdrawal" });
});


// System

app.get("/rules", (req, res) => {
  res.json({ rules: ["Rule 1: No cheating", "Rule 2: Answer in 7 seconds"] });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
