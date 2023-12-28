const ColorPredictionHistory = require("../../models/colourPredictionHistory");
const ColorPredictionWinner = require("../../models/colourPredictionWinner");
const Wallet = require("../../models/wallet.model");
const getIstTime = require("../../config/getTime");
const selectWin = require("../../models/selectWin");
const WiningReferralPercentage = require("../../models/winingReferrlIncomePercentage");

const getBettingHistoryByPeriodAndOptionSelectedByUser = require("../../utils/getBettingHistryByPeriodAndOptionSelectedByUser");
const PeriodRecord = require("../../models/periodRecord");

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

    const data = req.body;
    // console.log({ option: data?.option });
    const select = await selectWin.findOne({ id: "colorPredectionId" });
    // console.log(select);
    if (select?.id === "colorPredectionId") {
      await selectWin.findOneAndUpdate(
        { id: "colorPredectionId" },
        {
          $set: {
            option: data?.option,
          },
        },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "Winner Selected updated", option: data?.option });
    } else {
      await selectWin.create({
        id: "colorPredectionId",
        option: data?.option,
      });
      return res
        .status(200)
        .json({ message: "Winner Selected createx", option: data?.option });
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
    const winPercentage = await WiningReferralPercentage.findOne({
      id: "win-percentage",
    });

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
      await WiningReferralPercentage.create({
        id: "win-percentage",
        percentage: amount,
      });
      return res.status(200).json({ message: "Percentage created" });
    }

    return res.status(200).json({ message: "Percentage updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
const bettingHistory = async (req, res) => {
  try {
    const periodId = req.params.periodId;
    const periodRecords = await PeriodRecord.findOne(
      {
        periodId,
      },
      { option: 1, _id: 0 }
    );
    const winner = periodRecords?.option || null;

    const x1 = await getBettingHistoryByPeriodAndOptionSelectedByUser(
      "x1",
      periodId,
      winner
    );

    const x2 = await getBettingHistoryByPeriodAndOptionSelectedByUser(
      "x2",
      periodId,
      winner
    );
    const x3 = await getBettingHistoryByPeriodAndOptionSelectedByUser(
      "x3",
      periodId,
      winner
    );
    const x4 = await getBettingHistoryByPeriodAndOptionSelectedByUser(
      "x4",
      periodId,
      winner
    );
    const x5 = await getBettingHistoryByPeriodAndOptionSelectedByUser(
      "x5",
      periodId,
      winner
    );
    const x6 = await getBettingHistoryByPeriodAndOptionSelectedByUser(
      "x6",
      periodId,
      winner
    );
    const x7 = await getBettingHistoryByPeriodAndOptionSelectedByUser(
      "x7",
      periodId,
      winner
    );
    const x8 = await getBettingHistoryByPeriodAndOptionSelectedByUser(
      "x8",
      periodId,
      winner
    );
    const x9 = await getBettingHistoryByPeriodAndOptionSelectedByUser(
      "x9",
      periodId,
      winner
    );

    const x10 = await getBettingHistoryByPeriodAndOptionSelectedByUser(
      "x10",
      periodId,
      winner
    );
    const x11 = await getBettingHistoryByPeriodAndOptionSelectedByUser(
      "x11",
      periodId,
      winner
    );
    const x12 = await getBettingHistoryByPeriodAndOptionSelectedByUser(
      "x12",
      periodId,
      winner
    );

    const x13 = await getBettingHistoryByPeriodAndOptionSelectedByUser(
      "x13",
      periodId,
      winner
    );
    const data = {
      winner,
      history: {
        x1,
        x2,
        x3,
        x4,
        x5,
        x6,
        x7,
        x8,
        x9,
        x10,
        x11,
        x12,
        x13,
      },
    };

    // console.log( {data} )
    res.status(500).json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
module.exports = {
  AllColorPredictionsHistory,
  SelectWinner,
  winingRefferralPercentage,
  bettingHistory,
};
