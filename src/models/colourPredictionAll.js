const mongoose = require("mongoose");

const colourPredictionAllSchema = new mongoose.Schema(
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

const ColorPredictionAll = new mongoose.model(
  "colorPredictionAll",
  colourPredictionAllSchema
);

module.exports = ColorPredictionAll;
