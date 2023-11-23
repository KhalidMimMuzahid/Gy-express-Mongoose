const { check } = require("express-validator");
const User = require("../models/userModel");
const Wallet = require("../models/walletModel");

const fundValidation = [
  check("receiverUserid")
    .not()
    .notEmpty()
    .withMessage("Receiver user id is required")
    .custom(async (receiverUserid) => {
      const user = await User.findOne({ user_id: receiverUserid });
      if (!user?.user_id) {
        return Promise.reject("Receiver user id not found");
      }
    })
    .trim(),
  check("receiverConfirmUserid")
    .not()
    .isEmpty()
    .withMessage("Confirm receiver user id is required")
    .custom(async (receiverConfirmUserid, { req }) => {
      if (receiverConfirmUserid !== req.body.receiverUserid) {
        return Promise.reject("Confirm receiver id is not matched");
      }
    })
    .trim(),
  check("receiverName")
    .not()
    .isEmpty()
    .withMessage("Receiver name is required")
    .custom(async (receiverName, { req }) => {
      const user = await User.findOne({ user_id: req.body.receiverConfirmUserid });
      if (receiverName !== user?.name) {
        return Promise.reject("Receiver name is not correct");
      }
    })
    .trim(),
  check("amount")
    .not()
    .isEmpty()
    .withMessage("Token amount is required")
    .custom(async (amount, { req }) => {
      const wallet = await Wallet.findOne({ user_id: req.auth.id });
      if (amount > wallet?.totalHashProToken) {
        return Promise.reject("Insufficient Token Amount");
      }
    })
    .trim(),
];

module.exports = { fundValidation };
