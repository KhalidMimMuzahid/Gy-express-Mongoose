const ColorPrediction = require("../../models/colourPrediction ");
const ColorPredictionHistory = require("../../models/colourPredictionHistory");
const ColorPredictionWinner = require("../../models/colourPredictionWinner");
const Wallet = require("../../models/wallet.model");
const getIstTime = require("../../config/getTime");
const selectWin = require("../../models/selectWin");
const WiningReferralPercentage = require("../../models/winingReferrlIncomePercentage");

const AllColorPredictionsHistory = async (req, res) => {
  try {
    const allHistory = await ColorPredictionHistory.find({}).sort({
      serial: 1,
    });

    if (allHistory) {
      return res.status(200).json({ data: allHistory });
    } else {
      return res.status(400).json({ message: "Not Data Found!" });
    }
  } catch (error) {
    return res.status(400).json({
      message: error.toString(),
    });
  }
};

const SelectWinner = async (req, res) => {
  try {
    // const { color, number } = req.body;
    const { option } = req.body;
    const select = await selectWin.findOne({ id: "colorPredectionId" });
    console.log(select);
    if (select?.id === "colorPredectionId") {
      await selectWin.findOneAndUpdate(
        { id: "colorPredectionId" },
        {
          $set: {
            color: color,
            number: number,
          },
        },
        { new: true }
      );
      return res.status(200).json({ message: "Winner Selected updated" });
    } else {
      await selectWin.create({
        id: "colorPredectionId",
        color: color,
        number: number,
      });
      return res.status(200).json({ message: "Winner Selected createx" });
    }
    // return res.status(200).json({ message: "Winner Selected" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something want Wrong" });
  }
};

const winingRefferralPercentage = async (req, res) => {
  try {
    const { amount } = req.body;
    const winPercentage = await WiningReferralPercentage.findOne({ id: "win-percentage" });

    if (winPercentage) {
      // Update existing percentage
      await WiningReferralPercentage.findOneAndUpdate(
        { id: "win-percentage" },
        {
          $set: {
            percentage: amount,
          },
        },
        { new: true }
      );
    } else {
      // Create new percentage if it doesn't exist
      await WiningReferralPercentage.create({ id: "win-percentage", percentage: amount });
      return res.status(200).json({ message: "Percentage created" });
    }

    return res.status(200).json({ message: "Percentage updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  AllColorPredictionsHistory,
  SelectWinner,
  winingRefferralPercentage,
};
