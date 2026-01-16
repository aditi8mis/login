const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

router.post("/feedback", async (req, res) => {
  try {
    console.log("Feedback from frontend:", req.body);

    const { userID, rating, comment } = req.body;

    const feedback = new Feedback({
      userID,
      rating,
      comment
    });

    await feedback.save();
    res.json({ message: "Feedback saved successfully" });
  } catch (error) {
    console.error("Feedback error:", error);
    res.status(500).json({ error: "Feedback not saved" });
  }
});

module.exports = router;
