const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    name: { type: String, require: true },
    user_id: { type: String, require: true },
    sponsor_id: { type: String, require: true },
    totalStakeAmount: { type: Number, default: 0 },
    total_deposited_dollar: { type: Number, default: 0 },
    total_deposited_hpt: { type: Number, default: 0 },
    usdtBalance: { type: Number, default: 0 },
    busdBalance: { type: Number, default: 0 },
    stakingRoiIncome: { type: Number, default: 0 },
    stakingRewardIncome: { type: Number, default: 0 },
    directIncome: { type: Number, default: 0 },
    indirectIncome: { type: Number, default: 0 },
    teamIncome: { type: Number, default: 0 },
    allToken: { type: Number, default: 0 },
    totalHashProToken: { type: Number, default: 0 },
    joiningBonus: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Wallet = new mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
