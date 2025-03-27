const express = require("express");
const System = require("../models/systemModel");
const router = express.Router();

router.get("/rules", async (req, res) => {
  try {
    const system = await System.findOne();
    if (!system) return res.status(404).json({ message: "System not found" });
    res.json({ rules: system.rules });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/report/cheating", async (req, res) => {
  try {
    const system = await System.find();
    system.reports.push(req.body);
    await system.save();
    res.json({ message: "Report submitted for cheating" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/support/ticket", async (req, res) => {
  try {
    const system = await System.find();
    system.supportTickets.push(req.body);
    await system.save();
    res.json({ message: "Support ticket created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/report/update-status", (req, res) => {
  res.json({ message: "Report status updated" });
});

router.put("/support/update-ticket", (req, res) => {
  res.json({ message: "Support ticket updated" });
});

module.exports = router;


