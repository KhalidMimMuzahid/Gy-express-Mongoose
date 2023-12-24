const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  userId: String,
  fullName: String,
  sponsorId: String,
  sponsorName: String,
  investmentAmount: Number,
  roiIncome: Number,
  levelIncome: Number,
  directIncome: Number,
  indirectIncome: Number,
  depositBalance: Number,
  totalIncome: Number,
  winingWallect: Number,
  winingShare: Number,
  activeIncome: Number,
  joiningBonus: Number,
});

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
