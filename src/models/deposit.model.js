const mongoose = require("mongoose");

const depositeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    userId: { type: String, require: true },
    totalDeposit: { type: String },
    lastDepositAmount: Number,
    history: { type: [Object], default: [] },
    date: { type: String, default: new Date().toDateString() },
  },
  { timestamps: true }
);

const Deposite = new mongoose.model("Deposite", depositeSchema);

module.exports = Deposite;
