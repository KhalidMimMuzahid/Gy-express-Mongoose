const mongoose = require("mongoose");

const selectWinSchema = new mongoose.Schema(
  {
    id: { type: String, default: "colorPredectionId" },
    // color: {
    //   type: String,
    // },
    // number: Number,
    option: {
      type: String,
      enum: ["y1", "y2", "y3", "y4", "y5", "y6", "y7", "y8", "y9", "y10"],
    },
    // date: String,
    // period: String,
  },
  { timestamps: true }
);

const selectWin = new mongoose.model("selectWin", selectWinSchema);

module.exports = selectWin;
