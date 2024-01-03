const mongoose = require("mongoose");

const gameWalletIncomeSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    incomeFrom: {
      type: String,
      required: true,
    },

    level: {
      type: String,
      required: true,
    },

    percentageOfTotalAmount: Number,
    percentage: Number,
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },

    transactionID: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const GameWalletIncome = mongoose.model(
  "GameWalletIncome",
  gameWalletIncomeSchema
);

module.exports = GameWalletIncome;

//   userId,
//   incomeFrom,
//   level,
//   percentageOfTotalAmount,
//   percentage,
//   amount,
//   date,
//   time,
//   transactionID,
