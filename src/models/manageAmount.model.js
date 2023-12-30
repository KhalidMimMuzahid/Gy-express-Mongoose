const mongoose = require("mongoose");

const manageAmountSchema = new mongoose.Schema(
  {
    Id:{ type:String, default:"MANAGEAMOUNTID"},
    minimumDepositAmount : Number,
    minimumWithdrawAmount : Number,
    withdrawPercentage: Number,
  },
  { timestamps: true }
);
const ManageAmount = new mongoose.model("ManageAmount", manageAmountSchema);

module.exports = ManageAmount;
