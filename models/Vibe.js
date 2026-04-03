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

vibeSchema.statics.vibeDefaults = async function () {
  const defaults = [
    { vibeName: "Default", vibeKey: [] },
    { vibeName: "Chill", vibeKey: ["blue", "purple", "green"] },
    { vibeName: "Energetic", vibeKey: ["red", "yellow", "orange"] },
    { vibeName: "Productive", vibeKey: ["blue", "green", "yellow"] }
  ];

  for (const vibe of defaults) {
    await this.findOneAndUpdate(
      { vibeName: vibe.vibeName, userId: null },
      { ...vibe, userId: null },
      { upsert: true }
    );
  }
};
module.exports = mongoose.model("Vibe", vibeSchema);