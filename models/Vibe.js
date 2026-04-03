const mongoose = require("mongoose");

const vibeSchema = new mongoose.Schema({
  vibeName: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  vibeKey: {
    type: Array,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Vibe", vibeSchema);