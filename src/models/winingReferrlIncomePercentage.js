const mongoose = require("mongoose");

const WinPercentageSchema = new mongoose.Schema(
  {
    incomeToUserId: String,
    level: Number,
    incomeFromUserId: String,
    winningAmount: Number,
    percentage: Number,
    percentageOfTotalAmount: Number,
    type: {
      type: String,
      enum: ["profit-share", "winning-share"],
    },
    date: String,
  },
  { timestamps: true }
);

const WiningReferralPercentage = new mongoose.model(
  "ReferralPercentage",
  WinPercentageSchema
);

module.exports = WiningReferralPercentage;