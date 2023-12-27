const ColorPredictionWinner = require("../../models/colourPredictionWinner");
const LevelIncome = require("../../models/levelIncome.model");
const { RankIncome } = require("../../models/rankIncome.model");
const { PackageRoi } = require("../../models/topup.model");
const WiningReferralPercentage = require("../../models/winingReferrlIncomePercentage");

const getLevelIncome = async (req, res) => {
  try {
    const allLevelsReferralIncome = await WiningReferralPercentage.find({
      incomeToUserId: req.auth,
    });

    if (allLevelsReferralIncome) {
      return res.status(200).json({ data: allLevelsReferralIncome });
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};
// Get ROI income
const getRoiIncome = async (req, res) => {
  try {
    const {
      history,
      userId,
      fullName,
      sponsorId,
      currentPackage,
      totalReturnedAmount,
      incomeDay,
    } = await PackageRoi.findOne({ userId: req.auth });
    const data = {
      history: history.reverse(),
      userId,
      fullName,
      sponsorId,
      currentPackage,
      totalReturnedAmount,
      incomeDay,
    };
    if (data) {
      return res.status(200).json({ data: data });
    }
  } catch (error) {
    return res.status(400).json({ message: "Something went wrong" });
  }
};
// Get Rank income
const getRankIncome = async (req, res) => {
  try {
    const rankHistory = await RankIncome.find({ userId: req.auth });
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
const getMyWinningAmount = async (req, res) => {
  try {
    const myWinningHistory = await ColorPredictionWinner.find({
      userId: req.auth,
    });
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
  getLevelIncome,
  getRoiIncome,
  getRankIncome,
  getMyWinningAmount,
};
