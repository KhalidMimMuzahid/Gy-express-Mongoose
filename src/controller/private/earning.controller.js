const ColorPredictionWinner = require("../../models/colourPredictionWinner");
const LevelIncome = require("../../models/levelIncome.model");
const { RankIncome } = require("../../models/rankIncome.model");
const { PackageRoi } = require("../../models/topup.model");

const getAllLevelIncomeController = async (_req, res) => {
  try {
    const levelIncomes = await LevelIncome.find({}).sort({ createdAt: -1 });
    if (levelIncomes.length > 0) {
      return res.status(200).json({ data: levelIncomes });
    } else {
      return res.status(400).json({
        message: "There is no level income",
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: "Something went wrong",
    });
  }
};

// Get roi income
const getRoiIncomeController = async (_req, res) => {
  try {
    const rois = await PackageRoi.find({}).sort({ createdAt: -1 });
    const allRois = [];

    for (const roi of rois) {
      for (let i = roi?.history.length - 1; i >= 0; i--) {
        const history = roi?.history[i];
        allRois.push(history);
      }
    }

    // Check if there are deposits
    if (allRois.length === 0) {
      return res.status(400).json({
        message: "There is no ROI history",
      });
    }

    // Sort the allRois array in descending order based on createdAt
    allRois.sort((a, b) => b.incomeDateInt - a.incomeDateInt);

    // Return the list of deposits
    return res.status(200).json({
      message: "List of ROI",
      data: allRois,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
// Get Rank Income
const getRankIncomeController = async (_req, res) => {
  try {
    const rankHistory = await RankIncome.find({});
    if (rankHistory.length > 0) {
      return res.status(200).json({ data: rankHistory });
    } else {
      return res.status(400).json({ message: "There is no Rank history" });
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};

// Get My winning Amount
const getWinningAmount = async (req, res) => {
  try {
    const myWinningHistory = await ColorPredictionWinner.find({});
    if (myWinningHistory?.length > 0) {
      return res.status(200).json({ data: myWinningHistory });
    } else {
      return res.status(400).json({ message: "There is no Rank history" });
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};
module.exports = {
  getAllLevelIncomeController,
  getRoiIncomeController,
  getRankIncomeController,
  getWinningAmount,
};
