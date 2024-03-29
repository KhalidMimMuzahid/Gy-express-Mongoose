const mongoose = require("mongoose");

const colorPredictionSchema = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    option: {
      type: String,
      enum: [
        "x1",
        "x2",
        "x3",
        "x4",
        "x5",
        "x6",
        "x7",
        "x8",
        "x9",
        "x10",
        "x11",
        "x12",
        "x13",
      ],
    },
    period: String,
    date: String,
    totalContractMoney: Number,
  },
  { timestamps: true }
);

const ColorPrediction = new mongoose.model(
  "colorPrediction",
  colorPredictionSchema
);

module.exports = ColorPrediction;
