const mongoose = require("mongoose");

const rankSchema = new mongoose.Schema(
  {
    userId: String,
    fullName: String,
    sponsorId: String,
    sponsorName: String,
    rank: String,
    rankPosition: Number,
    rewardAmount: Number,
    date: String,
    time: String,
    transactionId: String,
  },
  { timestamps: true }
);

const RankIncome = mongoose.model("rankIncome", rankSchema);

module.exports = { RankIncome };
