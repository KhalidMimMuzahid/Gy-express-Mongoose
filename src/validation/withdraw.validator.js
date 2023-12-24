const { check } = require("express-validator");
const User = require("../models/auth.model");
const Wallet = require("../models/wallet.model");
const Bank = require("../models/addBank.model");

// withdrawAmount
const withdrawAmountValidators = [
  check("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .custom(async (amount, { req }) => {
      const wallet = await Wallet.findOne({ userId: req.auth });
      if (req.body.withdrawType === "profit" && Number(amount) < 50) {
        return Promise.reject("Minimum withdraw amount is ₹50");
      }
      if (req.body.withdrawType === "investment" && Number(amount) < 50) {
        return Promise.reject("Minimum withdraw amount is ₹50");
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
  check("accountNumber")
    .notEmpty()
    .withMessage("Account number is required")
    .custom(async (accountNumber, { req }) => {
      const bank = await Bank.findOne({ userId: req.auth });
      if (bank?.accountNumber !== accountNumber) {
        return Promise.reject("Account number is invalid");
      }
      // return;
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
