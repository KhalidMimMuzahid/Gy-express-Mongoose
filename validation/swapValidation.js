const { check } = require("express-validator");
const Wallet = require("../models/walletModel");

const swapValidation = [
  check("deductAmount").custom(async (deductAmount, { req }) => {
    if (!deductAmount) {
      return Promise.reject("Amount is required");
    }
    const findWallet = await Wallet.findOne({ user_id: req.auth.id });
    if (req.body.deductCurrency == "usdt") {
      if (deductAmount > findWallet?.usdtBalance)
        return Promise.reject("Insufficient Swap balance");
    }
    if (req.body.deductCurrency == "busd") {
      if (deductAmount > findWallet?.busdBalance)
        return Promise.reject("Insufficient Swap balance");
    }
    if (req.body.deductCurrency == "token") {
      if (deductAmount > findWallet?.totalHashProToken)
        return Promise.reject("Insufficient Swap balance");
    }
  }),
  check("creditCurrency")
    .custom(async (creditCurrency, { req }) => {
      if (!creditCurrency || !req.body.deductCurrency) {
        return Promise.reject("Currency is required");
      }
      if (creditCurrency == req.body.deductCurrency) {
        return Promise.reject("You can't swap between same currency");
      }
      if (creditCurrency == "usdt" && req.body.deductCurrency == "busd" || creditCurrency == "busd" && req.body.deductCurrency == "usdt") {
        return Promise.reject("You can't swap between usdt and busd");
      }
    })
    .trim(),
];

module.exports = { swapValidation };
