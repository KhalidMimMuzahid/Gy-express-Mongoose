const mongoose = require("mongoose");

const levelIncomeSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      // required: true,
    },
    incomeFrom: {
      type: String,
      required: true,
    },
    incomeFromFullName: {
      type: String,
      // required: true,
    },
    level: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["profit-share", "winning-share"],
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
    levelUserPackageInfo: {
      type: {
        amount: {
          type: Number,
          required: true,
        },
        date: String,
        time: String,
      },
      // required: true,
    },
    selfPackageInfo: {
      type: {
        amount: {
          type: Number,
          required: true,
        },
        date: String,
        time: String,
      },
      // required: true,
    },
    transactionID: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const LevelIncome = mongoose.model("LevelIncome", levelIncomeSchema);

module.exports = LevelIncome;







// userId,
// fullName,
// incomeFrom,
// incomeFromFullName,
// level,
// type,
// percentageOfTotalAmount,
// percentage,
// amount,
// date,
// time,
// transactionID
