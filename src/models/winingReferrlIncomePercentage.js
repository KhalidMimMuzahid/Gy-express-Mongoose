const mongoose = require("mongoose");

const WinPercentageSchema = new mongoose.Schema(
  {
    id: { type: String, default: "win-percentage" },
    percentage: Number,
  },
  { timestamps: true }
);

const WiningReferralPercentage = new mongoose.model(
  "ReferralPercentage",
  WinPercentageSchema
);

module.exports = WiningReferralPercentage;
