const mongoose = require("mongoose");

const SwapHistorySchema = new mongoose.Schema(
  {
    user_id: { type: String, require: true },
    email: { type: String, require: true },
    deductAmount: { type: Number, require: true },
    deductCurrency: String,
    creditAmount: { type: Number, require: true },
    creditCurrency: String,
    toExchangeType: String,
    date: { type: String, require: true },
    time: { type: String, require: true },
  },
  { timestamps: true }
);

const SwapHistory = new mongoose.model("SwapHistory", SwapHistorySchema);

module.exports = SwapHistory;
