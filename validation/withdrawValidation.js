const { check } = require("express-validator");
const User = require("../models/userModel");

// withdraw Amount
const withdrawAmountValidators = [
  check("amount").notEmpty().withMessage("Amount is required"),
  check("type").notEmpty().withMessage("Type is required"),
  check("trx_address")
    .notEmpty()
    .withMessage("TRX address is required")
    .custom(async (trx_address, { req }) => {
      const user = await User.findOne({ user_id: req.auth.id });
      if (req.body.type === "usdt" && !user?.usdtWallet) {
        return Promise.reject(
          "Please insert your wallet address from your profile"
        );
      }
      if (req.body.type === "busd" && !user?.busdWallet) {
        return Promise.reject(
          "Please insert your wallet address from your profile"
        );
      }
      if (req.body.type === "hpt" && !user?.hptWallet) {
        return Promise.reject(
          "Please insert your wallet address from your profile"
        );
      }
    }),
];

module.exports = { withdrawAmountValidators };
