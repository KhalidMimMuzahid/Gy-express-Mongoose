const generateUniqueIdByDate = require("../config/generateUniqueIdByDate");
const getIstTime = require("../config/getTime");
const ColorPrediction = require("../models/colourPrediction ");
const ColorPredictionAll = require("../models/colourPredictionAll");
const Level = require("../models/level.model");
const WinningSharePercentage = require("../models/levelCommissionPerCentageForWinningShare");
const ProidId = require("../models/periodId.model");
const PeriodRecord = require("../models/periodRecord");
const selectWin = require("../models/selectWin");
const Wallet = require("../models/wallet.model");
const WiningReferralPercentage = require("../models/winingReferrlIncomePercentage");
const DeleteAdminHistory = require("./DelectAdminHistory");
const findObjectFromArrayOfObject = require("./findObjectFromArrayOfObject");
const getPayOutAmount = require("./getPayOutAmount");
const getWinnerFilterOptionArray = require("./getWinnerFilterOptionArray");

const updateDataBaseAccordingToWinner = async (option) => {
  const winnerFilterOptionArray = getWinnerFilterOptionArray(option);
  const bets = await ColorPrediction.find({
    option: { $in: winnerFilterOptionArray },
  });
  let totalAmount = 0;

  // here we need winningSharePercentage not inside of any loop then it will call db multiple time
  const winningSharePercentage = await WinningSharePercentage.findOne({});
  for (const bet of bets) {
    const {
      _id,
      option: optionSelectedByUser,
      totalContractMoney,
      userId,
      period,
    } = bet;

    let payout = getPayOutAmount(
      optionSelectedByUser,
      option,
      totalContractMoney
    );
    const winningAmount = await ColorPredictionAll.findOneAndUpdate(
      { colorPrediction_id: _id },
      { winningAmount: payout },
      { upsert: true, new: true }
      // { new: true }
    );

    const wallects = await Wallet.findOneAndUpdate(
      { userId: bet.userId },
      {
        $inc: {
          winingWallect: +payout,
          totalIncome: +payout,
          activeIncome: +payout,
        },
      },
      { new: true }
    );
    totalAmount += payout;
    // now its time to share winning wallet to all levels of users
    const allLevelUsers = await Level.find(
      { "level.userId": bet.userId },
      { userId: 1, level: 1 }
    );
    if (allLevelUsers.length > 0) {
      for (const levelUser of allLevelUsers) {
        const levelObject = findObjectFromArrayOfObject(
          levelUser?.level,
          "userId",
          bet.userId
        );
        const percentage =
          winningSharePercentage[`level${levelObject.level}`] || 1;
        const winningSharePayout = (payout * percentage) / 100;
        const winningSharedUser = await Wallet.findOneAndUpdate(
          { userId: levelUser?.userId },
          {
            $inc: {
              winingShare: +winningSharePayout,
              totalIncome: +winningSharePayout,
              activeIncome: +winningSharePayout,
            },
          },
          { new: true }
        );
        if (winningSharedUser) {
          await WiningReferralPercentage.create({
            level: levelObject?.level,
            incomeFromUserId: bet?.userId,
            incomeToUserId: levelUser?.userId,
            winningAmount: winningSharePayout,
            percentage: percentage,
            percentageOfTotalAmount: payout,
            type: "winning-share",
            date: new Date(getIstTime().date).toDateString(),
          });
        }
      }
    }
  }

  const periodId = bets[0]?.period;
  if (periodId) {
    await PeriodRecord.create({
      periodId: periodId,
      option: option,
      // color: win.color,
      // number: win.number,
      price: totalAmount,
    });
  } else {
    // we need to create PeriodRecord document ==> first find the current period and create
    const lastPeriod = await ProidId.findOne().sort({ updatedAt: -1 });
    await PeriodRecord.create({
      periodId: lastPeriod?.period,
      option: option,
      price: totalAmount,
    });
  }
  await ColorPrediction.deleteMany({});
  await selectWin.deleteMany({}); // why are deleting all winner history here ?
  await DeleteAdminHistory(); // deleting admin dashboard data when the period has ended
  await generateUniqueIdByDate(); // generating periodId for every single period
  // console.log("Color Prediction Select Winner Done");
};

module.exports = updateDataBaseAccordingToWinner;
