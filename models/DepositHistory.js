const mongoose = require("mongoose");

const DepositHistorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    payment_method: {
      type: String,
      required: true,
    },
    deposited_amount: {
      type: Number,
      required: true,
    },
    currency_type: {
      type: String,
      enum: ["INR", "USD", "HPT"],
    },
    deposit_amount_dollar: {
      type: Number,
      require: true,
    },
    deposit_amount_hpt: {
      type: Number,
      require: true,
    },
    deposit_amount_hpt_to_dollar: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "success", "rejected"],
      default: "pending",
    },
    trxId: { type: String, require: true },
    date: { type: String, require: true },
    time: { type: String, require: true },
  },
  { timestamps: true }
);

const DepositHistory = new mongoose.model(
  "DepositHistory",
  DepositHistorySchema
);

module.exports = DepositHistory;
