const mongoose = require("mongoose");

const SystemWalletSchema = new mongoose.Schema(
  {
    infoId: {
      type: String,
      default: "system-info",
    },
    INR_for_per_dollar: {
      type: Number,
      default: 90,
    },
    per_hash_token_price_in_USDT: {
      type: Number,
      default: 90,
    },
    usd_for_per_usdt: {
      type: Number,
      default: 1,
    },
    usd_for_per_busd: {
      type: Number,
      default: 1,
    },
    popUpImageUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

const SystemWallet = new mongoose.model("SystemWallet", SystemWalletSchema);

module.exports = SystemWallet;
