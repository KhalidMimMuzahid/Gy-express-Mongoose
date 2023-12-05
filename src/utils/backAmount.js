const ColorPrediction = require("../models/colourPrediction ");
const ColorPredictionHistory = require("../models/colourPredictionHistory");
const Wallet = require("../models/wallet.model");

const backAmount = async () => {
  try {
    // Retrieve all ColorPrediction documents
    const bets = await ColorPrediction.find({});

    if (bets) {
      for (const bet of bets) {
        // Assuming you want to increment the 'totalContractMoney' field
        const wallet = await Wallet.findOneAndUpdate(
          { userId: bet.userId },
          {
            $inc: {
              investmentAmount: +bet.totalContractMoney,
            },
          },
          { new: true }
        );

        // Log the updated wallet for debugging (optional)
        console.log(`Updated wallet for userId ${bet.userId}:`);
      }

      await ColorPrediction.deleteMany({});
      await ColorPredictionHistory.deleteMany({});
    } else {
      console.log("No ColorPrediction documents found.");
    }
  } catch (error) {
    console.error("Error:", error);
    // Handle the error as needed
  }
};

module.exports = backAmount;
