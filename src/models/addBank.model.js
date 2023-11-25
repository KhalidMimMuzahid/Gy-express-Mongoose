const mongoose = require("mongoose");

const addBankSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, "User id is required"],
      },
  bankName: String,
  holderName: String,
  branchName: String,
  accountNumber: Number,
  IFSCCode: String,
 
},{
    timestamps: true
});

const Bank = mongoose.model("Bank", addBankSchema);

module.exports = Bank;


