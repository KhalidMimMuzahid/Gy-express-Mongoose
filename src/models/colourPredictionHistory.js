const mongoose = require("mongoose");

const colourPredictionHistorySchema = new mongoose.Schema(
  {
    color: {
      type: String,
      enm: ["red", "green", "violet", "red-violet", "green-violet"],
    },
    number: Number,
    numberOfUser: Number,
    amount: Number,
  },
  { timestamps: true }
);

const ColorPredictionHistory = new mongoose.model(
  "colorPredictionHistory",
  colourPredictionHistorySchema
);

module.exports = ColorPredictionHistory;
