const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  userId: String,
  fullName: String,
  sponsorId: String,
  sponsorName: String,

  selfInvestment: Number, //investmentAmount -->  selfInvestment
  roiIncome: Number, // Actinic Bonus  --> roiIncome
  levelROI: Number, //Profit Share ---> levelIncome ---> Level ROI
  // directIncome: Number,   // we are removing  direct income and main wallet
  // indirectIncome: Number,
  depositBalance: Number, //done
  totalIncome: Number, // done
  winingAmount: Number, //   winingWallect ---> winingAmount
  winingFromLevel: Number, // winningShare --->  winingFromLevel
  withdrawalBallance: Number, // activeIncome ---> withdrawalBallance
  gameWallet: Number,
  // joiningBonus: Number, // we are removing this field
});
const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
