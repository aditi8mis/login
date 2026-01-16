const mongoose = require("mongoose");

const MoodLogSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  detectedEmotion: {
    type: String,
    required: true
  },
  dateTime: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model("MoodLog", MoodLogSchema);
