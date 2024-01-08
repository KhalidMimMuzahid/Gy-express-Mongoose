const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    fullName: String,
    sponsorId: { type: String },
    sponsorName: String,
    requestAmount: Number,
    withdrawCharge: Number,
    amountAfterCharge: Number,
    chargeAmount: Number,
    currentAmount: Number,
    accountNumber: String,
    status: {
      type: String,
      enum: ["pending", "success", "rejected"],
      default: "pending",
    },
    transactionId: String,
    transactionHash: String,
    withdrawType: { type: String, enum: ["investment", "income"] },
    date: { type: String, default: new Date().toDateString() },
    time: String,
  },
  { timestamps: true }
);

const Withdraw = new mongoose.model("Withdraw", withdrawSchema);

module.exports = Withdraw;
