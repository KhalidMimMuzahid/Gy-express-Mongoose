const mongoose = require("mongoose");

const colourPredictionWinnerSchema = new mongoose.Schema(
  {
    // fullName: String,
    // box:Number,
    // number: Number,
    userId: { type: String, require: true },
    result: String, // this result is for storing options
    period: String,
    date: String,
    amount: Number,
  },
  { timestamps: true }
);

const ColorPredictionWinner = new mongoose.model(
  "colorPredictionWinner",
  colourPredictionWinnerSchema
);

module.exports = ColorPredictionWinner;
