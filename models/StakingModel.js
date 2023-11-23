const mongoose = require("mongoose");

const stakingSchema = new mongoose.Schema(
  {
    userId: String,
    fullName: String,
    sponsorId: String,
    sponsorName: String,
    stakeAmount: Number,
    stakeDate: {
      mileSecond: Number,
      formattedDate: String,
    },
    stakeDuration: Number,
    returnAmount: Number,
    returnDate: {
      mileSecond: Number,
      formattedDate: String,
    },
    isActive: { type: Boolean, default: true },
    isUnStaked: { type: Boolean, default: false },
    totalROIIncome: { type: Number, default: 0 },
    incomeDay: { type: Number, default: 0 },
    history: { type: [Object], default: [] },
    type: { type: String },
  },
  { timestamps: true }
);

const StakingPlan = new mongoose.model("StakingPlan", stakingSchema);

const stakingRewardSchema = new mongoose.Schema(
  {
    userId: String,
    fullName: String,
    sponsorId: String,
    sponsorName: String,
    stakingRewardIncome: Number,
    date: String,
    time: String,

  },
  { timestamps: true }
);

const StakingReward = new mongoose.model("StakingReward", stakingRewardSchema);

module.exports = {
  StakingPlan,
  StakingReward
};
