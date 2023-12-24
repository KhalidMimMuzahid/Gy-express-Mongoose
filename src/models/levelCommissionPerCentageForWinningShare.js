const mongoose = require("mongoose");

const winningSharePercentageSchema = new mongoose.Schema(
  {
    level1: { type: Number, default: 1 },
    level2: { type: Number, default: 1 },
    level3: { type: Number, default: 1 },
    level4: { type: Number, default: 1 },
    level5: { type: Number, default: 1 },
    level6: { type: Number, default: 1 },
    level7: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const WinningSharePercentage = new mongoose.model(
  "winningSharePercentage",
  winningSharePercentageSchema
);

module.exports = WinningSharePercentage;
