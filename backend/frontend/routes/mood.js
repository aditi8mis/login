const express = require("express");
const router = express.Router();
const MoodLog = require("../models/MoodLog");

// SAVE MOOD
router.post("/save-mood", async (req, res) => {
  try {
    const { userID, detectedEmotion, dateTime } = req.body;

    const mood = new MoodLog({
      userID,
      detectedEmotion,
      dateTime
    });

    await mood.save();
    res.json({ message: "Mood saved" });
  } catch (err) {
    res.status(500).json({ error: "Mood not saved" });
  }
});

// GET USER MOODS
router.get("/moods/:userID", async (req, res) => {
  const moods = await MoodLog.find({ userID: req.params.userID });
  res.json(moods);
});

module.exports = router;
