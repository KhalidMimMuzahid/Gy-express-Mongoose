const mongoose = require("mongoose");

const periodIdSchema = new mongoose.Schema(
  {
    id: { type: String, default: "colorPrediontionPriodID" },
    period: String,
    date: { type: String, default: new Date().toDateString() },
  },
  { timestamps: true }
);

const ProidId = new mongoose.model("PriodID", periodIdSchema);

module.exports = ProidId;
