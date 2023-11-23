const mongoose = require("mongoose");

const fundTransferSchema = new mongoose.Schema(
  {
    fundSenderUserId: String,
    fundSenderName: String,
    fundReceiverUserId: String,
    fundReceiverName: String,
    amount: Number,
    date: String,
    time: String,
  },
  { timestamps: true }
);

const FundTransfer = mongoose.model("FundTransfer", fundTransferSchema);

module.exports = { FundTransfer };
