const mongoose = require("mongoose");

const selectWinSchema = new mongoose.Schema(
  {
    id: { type: String, default: "colorPredectionId" },
    color: {
      type: String,
    },
    period: String,
    date: String,
    number: Number,
  },
  { timestamps: true }
);

const selectWin = new mongoose.model("selectWin", selectWinSchema);

module.exports = selectWin;
