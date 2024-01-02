const mongoose = require("mongoose");
const colourPredictionWinnerSchema = new mongoose.Schema(
  {
    userId: { type: String, require: true },
    result: String, // this result is for storing options
    period: String,
    date: String,
    time: String,
    bettingAmount: Number,
    winningAmount: Number,
    transactionId: String,
  },
  { timestamps: true }
);
colourPredictionWinnerSchema.statics.generateTransactionId = async () => {
  const generateTransactionId = (length = 10) => {
    const alphanumericCharacters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let transactionId = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(
        Math.random() * alphanumericCharacters.length
      );
      transactionId += alphanumericCharacters.charAt(randomIndex);
    }

    return transactionId;
  };
  let transactionId;

  let transactionIdIsExists;
  do {
    transactionId = generateTransactionId();
    transactionIdIsExists = await ColorPredictionWinner.findOne({
      transactionId,
    });
  } while (transactionIdIsExists);

  return transactionId;
};
colourPredictionWinnerSchema.pre("save", async function (next) {
  // console.log("Middleware on parent document"); // Will be executed

  // console.log({ this: this });
  this.transactionId = await ColorPredictionWinner.generateTransactionId();
  next();
});
const ColorPredictionWinner = new mongoose.model(
  "colorPredictionWinner",
  colourPredictionWinnerSchema
);

module.exports = ColorPredictionWinner;
