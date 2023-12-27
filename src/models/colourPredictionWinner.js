const mongoose = require("mongoose");
const colourPredictionWinnerSchema = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    result: String, // this result is for storing options
    period: String,
    date: String,
    time: String,
    bettingAmount: Number,
    winningAmount: Number,
  },
  { timestamps: true }
);

const ColorPredictionWinner = new mongoose.model(
  "colorPredictionWinner",
  colourPredictionWinnerSchema
);

module.exports = ColorPredictionWinner;
