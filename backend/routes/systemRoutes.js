const express = require("express")
const router = express.Router()

router.get("/rules", (req, res) => {
    res.json({ rules: ["Rule 1: No cheating", "Rule 2: Answer in 7 seconds"] });
  });


//POST

router.post("/report/cheating", (req, res) => {
    res.json({ message: "Report submitted for cheating" });
  });
  
router.post("/support/ticket", (req, res) => {
    res.json({ message: "Support ticket created successfully" });
  });

module.exports = router