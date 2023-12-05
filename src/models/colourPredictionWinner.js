const mongoose = require("mongoose");

const colourPredictionWinnerSchema = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    fullName: String,
    result: {
      type: String,
    },
    period: String,
    date: String,
    number: Number,
    amount: Number,
  },
  { timestamps: true }
);

const ColorPredictionWinner = new mongoose.model(
  "colorPredictionWinner",
  colourPredictionWinnerSchema
);

module.exports = ColorPredictionWinner;
