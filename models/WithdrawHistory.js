const mongoose = require("mongoose");

const WithdrawHistorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    user_id: { type: String, required: true },
    sponsor_id: { type: String, required: true },
    email: { type: String, required: true },
    request_amount: { type: Number, required: true },
    withdraw_charge: Number,
    amount_after_charge: Number,
    current_balance: { type: Number, required: true },
    status: { type: String, enum: ["pending", "success", "rejected"], default: "pending" },
    transaction_id: { type: String, required: true },
    hashTID: String,
    trx_address: String,
    type: { type: String, enum: ["usdt", "busd", "hpt"] },
    date: String,
    time: String,
  },
  { timestamps: true }
);

const WithdrawHistory = new mongoose.model(
  "WithdrawHistory",
  WithdrawHistorySchema
);

module.exports = WithdrawHistory;
