const { check } = require("express-validator");
const Wallet = require("../models/walletModel");
const { MONTHS } = require("../constant/staking.constant");
const { StakingPlan } = require("../models/StakingModel");

const stakingValidation = [
  check("duration")
    .notEmpty()
    .withMessage("Duration is required")
    .custom(async (duration) => {
      if (!MONTHS.includes(duration)) {
        return Promise.reject(`Invalid duration`);
      }
    }),
  check("amount")
    .not()
    .isEmpty()
    .withMessage("Amount is required")
    .custom(async (amount, { req }) => {
      const wallet = await Wallet.findOne({ user_id: req.auth.id });
      if (amount < 1) {
        return Promise.reject(`Minimum amount is 1 Hashpor Token`);
      }
      if (Number(amount) > wallet?.totalHashProToken) {
        return Promise.reject(`Insufficient Balance`);
      }
    })
    .trim(),
];
const unStakingValidation = [
  check("id")
    .notEmpty()
    .withMessage("Stake ID is required")
    .custom(async (id) => {
      const extId = await StakingPlan.findOne({ _id: id })
      if (!extId) {
        return Promise.reject(`Invalid Stake ID`);
      }
    })
    .trim(),
];

module.exports = {
  stakingValidation,
  unStakingValidation
};
