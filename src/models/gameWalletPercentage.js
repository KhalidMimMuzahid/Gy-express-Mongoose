const mongoose = require("mongoose");

const gameWalletPercentageSchema = new mongoose.Schema(
  {
    level1: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const GameWalletPercentage = new mongoose.model(
  "gameWalletPercentage",
  gameWalletPercentageSchema
);

module.exports = GameWalletPercentage;
