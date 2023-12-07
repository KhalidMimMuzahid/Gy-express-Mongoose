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
    incomeFrom: {
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
    
    selfPackageInfo: {
      type: {
        amount: {
          type: Number,
          required: true,
        },
        date: String,
        time: String,
      },
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

const WiningRefferalIncome = mongoose.model("WiningRefferalIncome", WiningRefferalIncomeSchema);

module.exports = WiningRefferalIncome;
