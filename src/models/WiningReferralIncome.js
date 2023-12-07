const mongoose = require("mongoose");

const WiningRefferalIncomeSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    incomeFromUserId: {
      type: String,
      required: true,
    },
    incomeFromFullName: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
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
    type: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const WiningRefferalIncome = mongoose.model(
  "WiningRefferalIncome",
  WiningRefferalIncomeSchema
);

module.exports = WiningRefferalIncome;
