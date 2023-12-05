const ColorPrediction = require("../../models/colourPrediction ");
const ColorPredictionHistory = require("../../models/colourPredictionHistory");
const ColorPredictionWinner = require("../../models/colourPredictionWinner");
const Wallet = require("../../models/wallet.model");
const getIstTime = require("../../config/getTime");
const selectWin = require("../../models/selectWin");

const AllColorPredictionsHistory = async (req, res) => {
  try {
    const allHistory = await ColorPredictionHistory.find({});
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
    const { color, number } = req.body;
    const select = await selectWin.find({});

    if (select) {
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
    } else {
      await selectWin.create({
        id: "colorPredectionId",
        color: color,
        number: number,
      });
    }
    return res.status(200).json({ message: "Winner Selected" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something want Wrong" });
  }
};

module.exports = { AllColorPredictionsHistory, SelectWinner };
