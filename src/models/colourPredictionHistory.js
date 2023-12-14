const mongoose = require("mongoose");

const colorPredictionHistorySchema = new mongoose.Schema(
  {
    // -------------------
    // color: {
    //   type: String,
    //   enm: ["red", "green", "violet", "red-violet", "green-violet"],
    // },
    // box: Number,
    // number: Number,
    // period: String,
    // --------------------

    serial: Number,
    option: {
      type: String,
      enum: ["y1", "y2", "y3", "y4", "y5", "y6", "y7", "y8", "y9", "y10"],
      unique: true,
    },
    numberOfUser: Number,
    amount: Number,
    priceCL: Number,
  },
  { timestamps: true }
);

const ColorPredictionHistory = new mongoose.model(
  "colorPredictionHistory",
  colorPredictionHistorySchema
);

module.exports = ColorPredictionHistory;
