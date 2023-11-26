const { check } = require("express-validator");
const User = require("../models/auth.model");
const Wallet = require("../models/wallet.model");

// withdrawAmount
const withdrawAmountValidators = [
  check("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .custom(async (amount, { req }) => {
      const wallet = await Wallet.findOne({ userId: req.auth });
      if (req.body.withdrawType === "profit" && Number(amount) < 10) {
        return Promise.reject("Minimum withdraw amount is $10");
      }
      if (
        (req.body.withdrawType === "investment" &&
          Number(amount) > wallet?.investmentAmount) ||
        (req.body.withdrawType === "profit" &&
          Number(amount) > wallet?.activeIncome)
      ) {
        return Promise.reject(
          `Insufficient Balance for ${
            req.body.withdrawType === "profit" ? "profit" : "investment"
          } withdrawal`
        );
      }
    }),
  check("trx_address")
    .notEmpty()
    .withMessage("Wallet address is required")
    .custom(async (trx_address, { req }) => {
      const user = await User.findOne({ userId: req.auth });
      if (user.walletAddress !== trx_address) {
        return Promise.reject("Wallet address is invalid");
      }
    })
    .trim(),
  check("withdrawType")
    .notEmpty()
    .withMessage("Withdraw type is required")
    .isIn(["investment", "profit"])
    .withMessage("Invalid withdraw type")
    .trim(),
];

module.exports = {
  withdrawAmountValidators,
};
