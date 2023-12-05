const mongoose = require("mongoose");

const colourPredictionSchema = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    fullName: String,
    color: {
      type: String,
      enm: ["red", "green", "violet", "red-violet", "green-violet"],
    },
    period: String,
    date: String,
    number: Number,
    contractMoney: Number,
    contractCount: Number,
    totalContractMoney: Number,
  },
  { timestamps: true }
);

const ColorPrediction = new mongoose.model(
  "colorPrediction",
  colourPredictionSchema
);

module.exports = ColorPrediction;
